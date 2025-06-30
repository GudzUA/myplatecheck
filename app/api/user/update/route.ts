import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type UpdateUserRequest = {
  email: string;
  plate?: string;
  login?: string;
};

export async function POST(req: Request) {
  const body: UpdateUserRequest = await req.json();
  const { email, plate, login } = body;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const updateData: Partial<{ plate: string; login: string }> = {};
  if (plate) updateData.plate = plate.toUpperCase();
  if (login) updateData.login = login.toLowerCase();

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    // Спочатку отримуємо поточного користувача, щоб знати старий login
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    // Якщо логін змінився — оновлюємо всі коментарі цього користувача
    if (login && login !== existing.login) {
      await prisma.comment.updateMany({
        where: { author: existing.login },
        data: { author: login.toLowerCase() },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}