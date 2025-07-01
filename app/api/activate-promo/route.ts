import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || code !== "PRO2025") {
      return NextResponse.json({ error: "Invalid code or email" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Уникнути повторної активації
    const alreadyUsed = await prisma.paymentHistory.findFirst({
      where: {
        email,
        type: "promo",
        details: code,
      },
    });

    if (alreadyUsed) {
      return NextResponse.json({ error: "Code already used" }, { status: 409 });
    }

    const now = new Date();
    const proUntil = new Date(now);
    proUntil.setDate(now.getDate() + 100); // 100 днів

    await prisma.user.update({
      where: { email },
      data: {
        pro: true,
        proUntil,
        tariff: "promo-100d",
        type: "pro",
      },
    });

    await prisma.paymentHistory.create({
      data: {
        email,
        type: "promo",
        amount: 0,
        currency: "CAD",
        createdAt: now,
        details: code,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ activate-promo error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
