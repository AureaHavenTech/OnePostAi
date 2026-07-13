import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeClient = new Stripe(key, { apiVersion: "2024-06-20" as any });
  return stripeClient;
}

function esc(v: any): string { return String(v ?? "").replace(/'/g, "''"); }

function persistInvoiceRecord(invoice: { id: string; customer: string; email: string; plan: string; amount: number; currency: string; status: string; date: string }) {
  try {
    const { execSync } = require("child_process");
    const sql = `INSERT OR REPLACE INTO invoices (id, customer, email, plan, amount, currency, status, date) VALUES ('${esc(invoice.id)}', '${esc(invoice.customer)}', '${esc(invoice.email)}', '${esc(invoice.plan)}', ${invoice.amount || 0}, '${esc(invoice.currency)}', '${esc(invoice.status)}', '${esc(invoice.date)}')`;
    execSync(`team-db "${sql}"`, { encoding: "utf8", stdio: "ignore" });
  } catch (e) { /* non-fatal */ }
}

// POST = Stripe webhook receiver
export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 300 }, // Stripe may fire many webhooks rapidly
  },
  async (req) => {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ success: false, error: "Stripe not configured" }, { status: 503 });
    }
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
      return NextResponse.json({ success: false, error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: `Invalid signature: ${e.message}` }, { status: 400 });
    }

    // Handle key event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const plan = (session.metadata?.plan as string) || "unknown";
        persistInvoiceRecord({
          id: `inv_${session.id}`,
          customer: session.customer_details?.name || session.client_reference_id || "stripe_customer",
          email: session.customer_details?.email || "",
          plan,
          amount: (session.amount_total || 0) / 100,
          currency: (session.currency || "usd").toUpperCase(),
          status: "paid",
          date: new Date().toISOString(),
        });
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const inv = event.data.object as any;
        persistInvoiceRecord({
          id: inv.id || `inv_${Date.now()}`,
          customer: inv.customer || "stripe_customer",
          email: inv.customer_email || "",
          plan: inv.lines?.data?.[0]?.price?.nickname || inv.lines?.data?.[0]?.description || "subscription",
          amount: (inv.amount_paid || 0) / 100,
          currency: (inv.currency || "usd").toUpperCase(),
          status: "paid",
          date: new Date().toISOString(),
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        persistInvoiceRecord({
          id: `sub_${sub.id}`,
          customer: sub.customer,
          email: "",
          plan: "subscription",
          amount: 0,
          currency: "USD",
          status: "cancelled",
          date: new Date().toISOString(),
        });
        break;
      }
      default:
        // Ignore other event types but acknowledge
        break;
    }

    return NextResponse.json({ received: true, type: event.type });
  }
);

// GET = session/lookup helper (for the dashboard to verify a purchase)
export const GET = withApi(
  {
    method: "GET",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
  },
  async (req) => {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ success: false, error: "session_id required" }, { status: 400 });
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ success: false, error: "Stripe not configured" }, { status: 503 });
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const subId = (session as any).subscription as string | undefined;
      let subscription = null;
      if (subId) {
        subscription = await stripe.subscriptions.retrieve(subId);
      }
      const isActive = subscription ? (subscription.status === "active" || subscription.status === "trialing") : (session.payment_status === "paid");
      return {
        success: true,
        sessionId,
        mode: session.mode,
        plan: (session.metadata?.plan as string) || "unknown",
        paymentStatus: session.payment_status,
        isActive,
        subscriptionStatus: subscription?.status || null,
        customerEmail: session.customer_details?.email || null,
        amountTotal: (session.amount_total || 0) / 100,
        currency: (session.currency || "usd").toUpperCase(),
      };
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e.message }, { status: 404 });
    }
  }
);
