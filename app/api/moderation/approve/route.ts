import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    console.log("✅ ЗАПИТ НА СХВАЛЕННЯ:", id);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Некоректний ID" }, { status: 400 });
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { pending: false },
    });

    console.log("✅ ОНОВЛЕНО:", updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Помилка при оновленні коментаря:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
