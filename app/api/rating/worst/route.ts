import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ratings = await prisma.driverRating.findMany({
      where: { type: "down" },
    });

    const grouped: Record<
      string,
      { plate: string; province: string; dislikes: number }
    > = {};

    for (const r of ratings) {
      const key = r.plate;
      if (!grouped[key]) {
        grouped[key] = {
          plate: r.plate,
          province: r.province || "default",
          dislikes: 0,
        };
      }
      grouped[key].dislikes += 1;
    }

    const result = Object.values(grouped).sort((a, b) => b.dislikes - a.dislikes);

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in /api/rating/worst:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
