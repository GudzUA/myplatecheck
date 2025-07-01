// app/api/donate/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json(); // напр. price_1RfobDKa6qWouAJyxwpeBIFB

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe donate error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
