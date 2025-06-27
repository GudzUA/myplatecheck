import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  let body;
try {
  body = await req.json();
} catch {
  return NextResponse.json({}, { status: 400 });
}

  const ids: string[] = body.commentIds || [];
  const email = body.email || "guest";

  if (!ids.length) {
    return NextResponse.json({}, { status: 200 }); // ✅ повертаємо порожній обʼєкт
  }

  const votes = await prisma.commentRating.findMany({
    where: {
      commentId: { in: ids },
    },
    select: {
      commentId: true,
      type: true,
      email: true,
    },
  });

  const result: Record<string, { up: number; down: number; userVote?: "up" | "down" }> = {};

  for (const id of ids) {
    const up = votes.filter((v) => v.commentId === id && v.type === "up").length;
    const down = votes.filter((v) => v.commentId === id && v.type === "down").length;
    const rawVote = votes.find((v) => v.commentId === id && v.email === email)?.type;
    const userVote = rawVote === "up" || rawVote === "down" ? rawVote : undefined;

    result[id] = { up, down, userVote };
  }

  return NextResponse.json(result);
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");
  const email = searchParams.get("email") || "guest";

  if (!idsParam) return NextResponse.json({}, { status: 400 });

  const ids = idsParam.split(",");

  const votes = await prisma.commentRating.findMany({
    where: {
      commentId: { in: ids },
    },
    select: {
      commentId: true,
      type: true,
      email: true,
    },
  });

  const result: Record<string, { up: number; down: number; userVote?: "up" | "down" }> = {};

  for (const id of ids) {
    const up = votes.filter((v) => v.commentId === id && v.type === "up").length;
    const down = votes.filter((v) => v.commentId === id && v.type === "down").length;
    const rawVote = votes.find((v) => v.commentId === id && v.email === email)?.type;
    const userVote = rawVote === "up" || rawVote === "down" ? rawVote : undefined;

    result[id] = { up, down, userVote };

  }

  return NextResponse.json(result);
}
