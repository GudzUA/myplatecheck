import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const login = body.login;

    if (!login) {
      return NextResponse.json({ error: "Missing login" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        author: login,
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
