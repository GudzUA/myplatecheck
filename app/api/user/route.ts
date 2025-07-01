import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true, // ⬅️ Додай це
    email: true,
    login: true,
    pro: true,
    type: true,
    tariff: true,
    proUntil: true,
    paymentHistory: true,
    plate: true,
    joinRadioDraw: true,
  },
});

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}