import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const includePayments = searchParams.get("includePayments") === "true";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        login: true,
        plate: true,
        type: true,
        pro: true,
        proUntil: true,
        tariff: true,
        usedInitialLimit: true,
        createdAt: true,
        paymentHistory: includePayments,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("❌ CHECK-USER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
