import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY not set — skipping checkout session setup");
}

const stripe = secretKey ? new Stripe(secretKey, { apiVersion: "2023-10-16" }) : null;

// Базові ціни в канадських центах (без податку)
const basePrices = {
  daily: 99,
  monthly: 399,
  yearly: 2394,
};

const finalPrices = {
  daily: Math.round(basePrices.daily * 1.12),
  monthly: Math.round(basePrices.monthly * 1.12),
  yearly: Math.round(basePrices.yearly * 1.12),
};

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 });
  }

  const { plan }: { plan: "daily" | "monthly" | "yearly" } = await req.json();

  if (!["daily", "monthly", "yearly"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.headers.get("origin") || "https://myplatecheck.ca";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    currency: "cad",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: finalPrices[plan],
          product_data: {
            name: `MyPlateCheck PRO – ${plan} (incl. 12% tax)`,
          },
        },
      },
    ],
    success_url: `${origin}/upgrade-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${origin}/upgrade-failed`,
  });

  return NextResponse.json({ url: session.url });
}
