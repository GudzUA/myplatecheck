import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <== виправлено

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const login = searchParams.get("login");

  if (!login) {
    return NextResponse.json({ error: "Missing login" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { login }, // 👈 правильний ключ (з малої)
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
