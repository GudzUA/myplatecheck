import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");
  const email = searchParams.get("email");

  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  const up = await prisma.commentRating.count({
    where: { commentId, type: "up" },
  });

  const down = await prisma.commentRating.count({
    where: { commentId, type: "down" },
  });

  const userVote = email
    ? await prisma.commentRating.findFirst({
        where: { commentId, email },
      })
    : null;

  return NextResponse.json({
    up,
    down,
    userVote: userVote?.type || null,
  });
}

export async function POST(req: Request) {
  const { commentId, email, type } = await req.json();

  if (!commentId || typeof email !== "string" || !["up", "down"].includes(type)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || !comment.plate || !comment.province) {
    return NextResponse.json({ error: "Missing plate or province in comment" }, { status: 400 });
  }

  const existing = await prisma.commentRating.findFirst({
    where: { commentId, email },
  });

  if (existing) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  await prisma.commentRating.create({
    data: {
      commentId,
      email,
      type,
      plate: comment.plate,
      province: comment.province,
    },
  });

  const up = await prisma.commentRating.count({
    where: { commentId, type: "up" },
  });

  const down = await prisma.commentRating.count({
    where: { commentId, type: "down" },
  });

  return NextResponse.json({ rating: { up, down }, userVote: type });
}
