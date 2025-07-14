import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        pending: true,
        parentId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        plate: true,
        province: true,
        author: true,
        comment: true,
        email: true,
        createdAt: true,
        badges: true,
        pending: true,
        videoUrl: true,
        media: true,
        language: true,
      },
    });

    return NextResponse.json(comments);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ ПОМИЛКА GET /api/comments/pending:", message);
  return NextResponse.json(
    { error: "Не вдалося завантажити коментарі для модерації" },
    { status: 500 }
  );
}

}
