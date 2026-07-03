import { NextResponse } from "next/server";

// Stripe Checkout Session creation
// In production, this uses the Stripe SDK: stripe.checkout.sessions.create()
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    // Stripe Checkout configuration:
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: email,
    //   client_reference_id: userId,
    //   line_items: [{ price: "price_onepost_monthly", quantity: 1 }],
    //   mode: "subscription",
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    // });

    return NextResponse.json({
      success: true,
      sessionUrl: "https://checkout.stripe.com/demo/session",
      sessionId: `cs_${Date.now()}`,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

// Stripe Webhook handler — verifies subscription status
// In production, verify the webhook signature with stripe.webhooks.constructEvent()
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing session_id" },
      { status: 400 }
    );
  }

  // Verify subscription status from Stripe:
  // const session = await stripe.checkout.sessions.retrieve(sessionId);
  // const subscription = await stripe.subscriptions.retrieve(session.subscription);
  // const isActive = subscription.status === "active" || subscription.status === "trialing";

  const isActive = true; // Demo: always active

  return NextResponse.json({
    success: true,
    subscription: {
      status: isActive ? "active" : "inactive",
      plan: "$29/month",
      sessionId,
    },
  });
}