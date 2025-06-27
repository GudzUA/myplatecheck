// app/api/comments/route.ts
import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newComment = await prisma.comment.create({
  data: {
    author: body.author || "Гість",
    plate: body.plate,
    province: body.province,
    comment: body.comment,
    email: body.email?.trim() || "guest@myplatecheck.com",
    media: body.media || [],
    videoUrl: body.videoUrl || "",
    parentId: body.parentId || null,
    pending: true,
    badges: Array.isArray(body.badges) ? body.badges : [],
  },
});

    console.log("✅ Коментар збережено:", newComment);
    return NextResponse.json(newComment);
  } catch (error) {
  const err = error as Error;
  console.error("❌ Помилка збереження в базу:", err?.message || err);
    return NextResponse.json(
      { error: "Не вдалося зберегти коментар" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get("plate");
  const province = searchParams.get("province");
  const includeReplies = searchParams.get("includeReplies") === "true";

const where: Prisma.CommentWhereInput = {
  pending: false,
  parentId: null,
};

  if (!includeReplies) where.parentId = null;
  if (plate) where.plate = plate;
  if (province) where.province = province;

  try {
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200, // Обмеження щоб не лягала база
    });

    return NextResponse.json(comments);
  } catch (error) {
  const err = error as Error;
  console.error("❌ ПОМИЛКА GET /api/comments:", err?.message || err);
    return NextResponse.json(
      { error: "Не вдалося завантажити коментарі" },
      { status: 500 }
    );
  }
}

