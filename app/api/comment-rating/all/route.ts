import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ratings = await prisma.commentRating.findMany();

    // Групуємо голоси по commentId
    const grouped: Record<string, { up: number; down: number }> = {};

    for (const r of ratings) {
      if (!grouped[r.commentId]) grouped[r.commentId] = { up: 0, down: 0 };
      if (r.type === "up") grouped[r.commentId].up++;
      else if (r.type === "down") grouped[r.commentId].down++;
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("❌ Failed to load ratings:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
