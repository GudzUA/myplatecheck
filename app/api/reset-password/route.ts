import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, token, newPassword } = await req.json();

  if (!email || !token || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const reset = await prisma.passwordResetToken.findUnique({
    where: { userId: user.id },
  });

  if (!reset || reset.token !== token || reset.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  // оновлюємо пароль
  await prisma.user.update({
    where: { email },
    data: { password: newPassword },
  });

  // видаляємо токен
  await prisma.passwordResetToken.delete({ where: { userId: user.id } });

  return NextResponse.json({ success: true });
}
