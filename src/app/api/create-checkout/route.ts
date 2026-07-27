import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { STRIPE_PRICE_CATALOG, PRICE_ID_TO_KEY, getStripe, getBaseUrl, logCheckoutEvent } from "@/lib/stripe-client";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => {
      if (!b?.priceId && !b?.plan) return "Either priceId or plan is required";
      if (b?.priceId && !b.priceId.startsWith("price_")) return "priceId must start with 'price_'";
      if (b?.plan && typeof b.plan !== "string") return "plan must be a string";
      return true;
    },
  },
  async (req, body) => {
    const { priceId, plan, email, userId, successUrl, cancelUrl } = body as { priceId?: string; plan?: string; email?: string; userId?: string; successUrl?: string; cancelUrl?: string };

    // Resolve plan key → priceId
    let resolvedPriceId: string | null = null;
    let planMeta: any = null;
    if (plan && STRIPE_PRICE_CATALOG[plan]) {
      planMeta = STRIPE_PRICE_CATALOG[plan];
      resolvedPriceId = planMeta.priceId;
    } else if (priceId) {
      const key = PRICE_ID_TO_KEY[priceId];
      if (!key) return NextResponse.json({ success: false, error: `Unknown priceId. Valid: ${Object.keys(STRIPE_PRICE_CATALOG).join(", ")}` }, { status: 400 });
      planMeta = STRIPE_PRICE_CATALOG[key];
      resolvedPriceId = priceId;
    }
    if (!resolvedPriceId || !planMeta) return NextResponse.json({ success: false, error: "Could not resolve price" }, { status: 400 });

    const baseUrl = getBaseUrl(req);
    const finalSuccessUrl = successUrl || `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/pricing?checkout=cancelled`;

    const stripe = getStripe();
    if (!stripe) {
      const stubUrl = `https://buy.stripe.com/${planMeta.mode === "subscription" ? "test" : "test"}_${resolvedPriceId.slice(-8)}`;
      logCheckoutEvent("stub_no_secret", { plan, priceId: resolvedPriceId, email, userId });
      return NextResponse.json({
        success: true,
        mode: "stub",
        message: "Stripe SDK not configured (missing STRIPE_SECRET_KEY). Set STRIPE_SECRET_KEY in .env.local to enable real checkout.",
        sessionUrl: stubUrl,
        sessionId: `stub_${Date.now()}`,
        priceId: resolvedPriceId,
        plan: planMeta,
      });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: planMeta.mode,
        line_items: [{ price: resolvedPriceId, quantity: 1 }],
        customer_email: email || undefined,
        client_reference_id: userId || undefined,
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        allow_promotion_codes: true,
        metadata: { plan: plan || PRICE_ID_TO_KEY[resolvedPriceId], priceId: resolvedPriceId, userId: userId || "anonymous" },
      });
      logCheckoutEvent("session_created", { sessionId: session.id, plan, priceId: resolvedPriceId, email, userId });
      return NextResponse.json({
        success: true,
        mode: "live",
        sessionId: session.id,
        sessionUrl: session.url,
        priceId: resolvedPriceId,
        plan: planMeta,
      });
    } catch (e: any) {
      console.error("[create-checkout] Stripe error:", e?.message);
      return NextResponse.json({ success: false, error: e?.message || "Stripe checkout failed", code: e?.code }, { status: 502 });
    }
  }
);

export const GET = withApi(
  {
    method: "GET",
    cache: "long",
  },
  async () => {
    return { catalog: STRIPE_PRICE_CATALOG, validPlanKeys: Object.keys(STRIPE_PRICE_CATALOG) };
  }
);
