import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

type PaymentEntry = {
  plan: string;
  amount: number;
  date: string;
};

export async function POST(req: Request) {
  try {
    const { sessionId, email } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json({ error: "Missing sessionId or email" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
    }

    const plan = session?.metadata?.plan;
    if (!["daily", "monthly", "yearly"].includes(plan as string)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const now = new Date();

    const proUntil = new Date(now);
    if (plan === "daily") proUntil.setDate(now.getDate() + 1);
    if (plan === "monthly") proUntil.setMonth(now.getMonth() + 1);
    if (plan === "yearly") proUntil.setFullYear(now.getFullYear() + 1);

    const user = await prisma.user.findUnique({ where: { email } });

    let history: PaymentEntry[] = [];
    try {
      if (user?.paymentHistory) {
        const parsed = JSON.parse(user.paymentHistory as string) as PaymentEntry[];
        if (Array.isArray(parsed)) history = parsed;
      }
    } catch {
      console.warn("⚠️ Failed to parse paymentHistory, resetting it");
    }

    history.push({
      plan: plan!,
      amount,
      date: now.toISOString(),
    });

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        pro: true,
        proUntil,
        tariff: plan,
        type: "pro",
        paymentHistory: history,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
