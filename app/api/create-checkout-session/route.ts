import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Базові ціни в копійках
const basePrices = {
  daily: 99,
  monthly: 399,
  yearly: 2394,
};

// Остаточні з податками (12%)
const finalPrices = {
  daily: Math.round(basePrices.daily * 1.12),
  monthly: Math.round(basePrices.monthly * 1.12),
  yearly: Math.round(basePrices.yearly * 1.12),
};

const promoPrice = 223; // 💰 ціна для акції (вже з податком)

export async function POST(req: NextRequest) {
  const { plan }: { plan: "daily" | "monthly" | "yearly" | "promo" } = await req.json();

  if (!["daily", "monthly", "yearly", "promo"].includes(plan)) {
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
          unit_amount: plan === "promo" ? promoPrice : finalPrices[plan],
          product_data: {
            name:
              plan === "promo"
                ? "MyPlateCheck PRO — Promo (1 year, incl. taxes)"
                : `MyPlateCheck PRO – ${plan} (incl. 12% tax)`,
          },
        },
      },
    ],
    success_url: `${req.headers.get("origin")}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get("origin")}/upgrade-failed`,
    metadata: {
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
