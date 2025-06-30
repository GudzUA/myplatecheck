import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignBadges } from "@/utils/badges";

export async function POST(req: Request) {
  const body = await req.json();
  const { type, email, login, plate, password } = body;
  const emailClean = email.trim().toLowerCase();

  if (type === "login") {
    const user = await prisma.user.findFirst({
      where: { email: emailClean },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // перевірка PRO
    let updatedUser = { ...user };
    if (updatedUser.pro && updatedUser.proUntil) {
      const isExpired = new Date(updatedUser.proUntil) < new Date();
      if (isExpired) {
        updatedUser = await prisma.user.update({
          where: { email: emailClean },
          data: {
            pro: false,
            proUntil: null,
            tariff: null,
            type: "registered",
          },
        });
      }
    }

    return NextResponse.json({
      ...updatedUser,
      badges: assignBadges(updatedUser),
    });
  }

  if (type === "register") {
    if (!email || !plate || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: emailClean } });
    if (existing) {
      return NextResponse.json({ error: "Email exists" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        email: emailClean,
        login: login?.trim() || "", // просто записуємо, не перевіряємо
        plate,
        password,
        type: "registered",
      },
    });

    return NextResponse.json({
      ...newUser,
      badges: assignBadges(newUser),
    });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

