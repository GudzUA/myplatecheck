// /app/api/user/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || email.startsWith("guest")) {
      return NextResponse.json({ pro: false });
    }

    const payments = await prisma.paymentHistory.findMany({
      where: {
        email,
        type: { in: ["manual", "promo", "stripe"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!payments.length) {
      return NextResponse.json({ pro: false });
    }

    const latest = payments[0];
    const expiresAt = new Date(latest.createdAt);
    expiresAt.setDate(expiresAt.getDate() + 100); // 100 днів доступу

    const now = new Date();
    const isActive = expiresAt > now;

    return NextResponse.json({ pro: isActive });
  } catch (e) {
    console.error("❌ user/status error:", e);
    return NextResponse.json({ pro: false });
  }
}
