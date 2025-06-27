import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      where: { pending: true },
      orderBy: { createdAt: "desc" },
      take: 100, // максимум 100 — безпечно
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("❌ ПОМИЛКА MODERATOR GET /comments:", (error as Error).message || error);
    return NextResponse.json(
      { error: "Не вдалося завантажити коментарі модерації" },
      { status: 500 }
    );
  }
}
