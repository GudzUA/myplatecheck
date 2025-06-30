import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // ← ⬅️ Цей рядок був відсутній
    const userId = body.userId;
    const login = body.login;

    if (!userId && !login) {
      return NextResponse.json({ error: "Missing userId or login" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        OR: [
          { userId },
          { author: login },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
