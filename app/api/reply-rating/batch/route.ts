// /app/api/reply-rating/batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { replyIds, email } = await req.json();

    if (!Array.isArray(replyIds) || !email) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const ratings = await prisma.replyRating.groupBy({
      by: ["replyId", "type"],
      where: {
        replyId: { in: replyIds },
      },
      _count: true,
    });

    const userVotes = await prisma.replyRating.findMany({
      where: {
        replyId: { in: replyIds },
        email,
      },
      select: {
        replyId: true,
        type: true,
      },
    });

    const result: Record<
      string,
      { up: number; down: number; userVote?: "up" | "down" }
    > = {};

    for (const id of replyIds) {
      result[id] = { up: 0, down: 0 };
    }

    for (const r of ratings) {
      if (r.type === "up") result[r.replyId].up = r._count;
      if (r.type === "down") result[r.replyId].down = r._count;
    }

    for (const vote of userVotes) {
      result[vote.replyId].userVote = vote.type as "up" | "down";
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Batch reply rating error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
