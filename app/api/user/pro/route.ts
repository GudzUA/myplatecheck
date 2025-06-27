// app/api/user/pro/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (email !== "gudz80@gmail.com") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { email },
    data: {
      pro: true,
      type: "pro",
      proUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(updated);
}
