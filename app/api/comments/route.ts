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
    userId: body.userId,
    plate: body.plate,
    province: body.province?.toLowerCase(),
    comment: body.comment,
    email: body.email?.trim() || "guest@myplatecheck.com",
    media: body.media || [],
    videoUrl: body.videoUrl || "",
    parentId: body.parentId || null,
    pending: body.parentId ? false : true,
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
  const includeReplies = searchParams.get("includeReplies");

  let where: Prisma.CommentWhereInput = {
    pending: false,
  };

  if (includeReplies !== "true") {
    where = { ...where, parentId: null };
  }

  if (plate) {
    where = { ...where, plate };
  }

  if (province) {
    where = { ...where, province };
  }

  try {
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(comments);
  } catch (error) {
    const err = error as Error;
    console.error("❌ ПОМИЛКА GET /api/comments:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}