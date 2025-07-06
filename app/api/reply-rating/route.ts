import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { replyId, email, type } = await req.json();

  if (!replyId || !email || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const existing = await prisma.replyRating.findUnique({
      where: {
        replyId_email: {
          replyId,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }

    await prisma.replyRating.create({
      data: {
        replyId,
        email,
        type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const replyId = searchParams.get("replyId");
  const email = searchParams.get("email");

  if (!replyId) {
    return NextResponse.json({ error: "Missing replyId" }, { status: 400 });
  }

  try {
    const up = await prisma.replyRating.count({
      where: { replyId, type: "up" },
    });

    const down = await prisma.replyRating.count({
      where: { replyId, type: "down" },
    });

    const userVote = email
      ? await prisma.replyRating.findUnique({
          where: {
            replyId_email: {
              replyId,
              email,
            },
          },
        })
      : null;

    return NextResponse.json({
      up,
      down,
      userVote: userVote?.type || null,
    });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
