// /app/api/stripe/checkout-promo/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  try {
    const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "cad",
        product_data: {
          name: "PRO Access — Promo Annual",
          description: "1 year of PRO access (includes taxes)",
        },
        unit_amount: 223, // сума ВЖЕ з податком, у копійках
      },
      quantity: 1,
    },
  ],
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade-success`,
  cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
  metadata: {
    promo: "true",
    fixed_tax_included: "yes",
    total_with_tax: "2.23",
  },
});

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe promo session error:", error);
    return NextResponse.json({ error: "Failed to create promo session" }, { status: 500 });
  }
}
