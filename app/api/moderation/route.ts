import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    // 🔒 Доступ тільки для модератора
    if (!email || email !== "test@test.com") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 🔄 Отримати останні 50 коментарів
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,

    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error("❌ Error fetching moderator comments:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
