// /api/email-capture — Capture lead emails + select email template
// POST { email, name?, source?, template?, plan?, metadata?, sendNow?, userId? }
// GET ?email=X&source=Y — list captures
// Response includes the resolved template + rendered subject/body/html so
// the frontend can preview before sending, or pass straight to the mailer.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { captureEmail, listEmailCaptures, listEmailTemplates, getEmailTemplate, renderEmailTemplate } from "@/lib/services/utility-apis";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SOURCES = ["landing", "pricing", "checkout", "signup", "trial", "welcome", "content", "receipt", "billing", "reset", "forgot", "waitlist", "manual", "import"];

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    // ?templates=1 — list all templates (used by designer/email-campaign UI)
    if (String(body?.templates || "") === "1") {
      return {
        success: true,
        templates: listEmailTemplates(),
        total: listEmailTemplates().length,
        meta: { note: "Once Resend/Postmark API keys are added, sending switches to live mode automatically." },
      };
    }
    // ?template=welcome — render a single template with optional ?vars[...]=...
    if (body?.template) {
      const tpl = getEmailTemplate(String(body.template));
      if (!tpl) {
        return NextResponse.json(
          { success: false, error: `Unknown template. Valid: ${listEmailTemplates().map((t) => t.id).join(", ")}` },
          { status: 400 }
        );
      }
      const vars: Record<string, any> = {};
      for (const [k, v] of Object.entries(body)) {
        if (k.startsWith("vars.") || k.startsWith("v.")) {
          vars[k.split(".").slice(1).join(".")] = v;
        } else if (k === "name" || k === "plan" || k === "amount") {
          vars[k] = v;
        }
      }
      return { success: true, template: tpl, rendered: renderEmailTemplate(tpl.id, vars) };
    }
    // Otherwise list captures with optional filters
    const email = (body?.email as string) || undefined;
    const source = (body?.source as string) || undefined;
    const limit = body?.limit ? parseInt(String(body.limit), 10) : 50;
    const items = listEmailCaptures({ email, source, limit });
    return { success: true, captures: items, total: items.length };
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => {
      if (!b?.email) return "email is required";
      if (!EMAIL_REGEX.test(String(b.email))) return "email must be a valid email address";
      if (b?.source && !VALID_SOURCES.includes(String(b.source))) {
        return `source must be one of: ${VALID_SOURCES.join(", ")}`;
      }
      return true;
    },
  },
  async (req, body) => {
    const out = captureEmail({
      email: body.email,
      name: body.name,
      source: body.source,
      template: body.template,
      plan: body.plan,
      metadata: body.metadata,
      userId: body.userId,
      sendNow: body.sendNow,
    });

    if (!out.capture.persisted) {
      return NextResponse.json(
        { success: false, error: "Failed to persist email capture", capture: out.capture },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        capture: out.capture,
        template: out.template,
        rendered: out.rendered,
        // Top-level convenience fields the frontend can use without reaching in
        incentive: out.rendered
          ? {
              message: out.template?.preview || out.rendered.subject,
              subject: out.rendered.subject,
              template: out.template?.id,
            }
          : { message: "Thanks! Check your inbox for next steps.", template: out.capture.template },
        meta: {
          note: "Email capture persisted. Live send is wired when RESEND_API_KEY or POSTMARK_API_KEY is set. Until then, render the template client-side or use a webhook.",
          nextStep: out.capture.status === "pending" ? "Trigger a mailer webhook with capture.id to send." : "Marked sent; no further action needed.",
        },
      },
      { status: 201 }
    );
  }
);
