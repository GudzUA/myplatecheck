import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export async function POST(req: NextRequest) {
  try {
    const { session_id, plan, email } = await req.json();

    if (!session_id || !email) {
      return NextResponse.json({ success: false, error: "Missing session_id or email" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 402 });
    }

    const now = Date.now();
    const duration = plan === "monthly" ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    const updatedUser = {
      email,
      proUntil: new Date(now + duration).toISOString(),
      paymentHistory: [
        {
          id: session.id,
          amount: session.amount_total / 100,
          date: new Date().toISOString(),
          plan,
        },
      ],
    };

    return NextResponse.json({ success: true, updatedUser });
  } catch (error) {
    console.error("❌ Stripe verify error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
