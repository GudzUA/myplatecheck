// app/api/moderation/all-comments/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.type !== "moderator") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Отримуємо всі унікальні email-и з коментарів
    const emails = comments.map(c => c.email).filter(Boolean) as string[];

    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, proUntil: true }
    });

    const userMap = new Map(
      users.map(u => [
        u.email,
        u.proUntil && new Date(u.proUntil) > new Date() ? "pro" : "registered",
      ])
    );

    const withStatus = comments.map(c => ({
      ...c,
      userType: c.email ? userMap.get(c.email) || "registered" : "guest"
    }));

    return NextResponse.json(withStatus);
  } catch (err) {
    console.error("❌ Failed to load all comments:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
