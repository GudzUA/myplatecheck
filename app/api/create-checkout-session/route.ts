import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// Базові ціни в канадських центах (без податку)
const basePrices = {
  daily: 99,     // 0.99 CAD
  monthly: 399,  // 0.99 CAD
  yearly: 2394,  // 23.94 CAD
};

// Додаємо 12% податку
const finalPrices = {
  daily: Math.round(basePrices.daily * 1.12),     // ≈ 110
  monthly: Math.round(basePrices.monthly * 1.12), // ≈ 447
  yearly: Math.round(basePrices.yearly * 1.12),   // ≈ 2681
};

export async function POST(req: NextRequest) {
  const { plan } = await req.json();

  if (!["daily", "monthly", "yearly"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

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
    success_url: `${req.headers.get("origin")}/upgrade-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${req.headers.get("origin")}/upgrade-failed`,
  });

  return NextResponse.json({ url: session.url });
}
