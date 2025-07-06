// app/api/rating/worst/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allRatings = await prisma.driverRating.findMany();

    const grouped: Record<
      string,
      { plate: string; province: string; up: number; down: number }
    > = {};

    for (const r of allRatings) {
      const key = `${r.plate}_${r.province}`;
      if (!grouped[key]) {
        grouped[key] = {
          plate: r.plate,
          province: r.province || "default",
          up: 0,
          down: 0,
        };
      }
      if (r.type === "up") grouped[key].up += 1;
      if (r.type === "down") grouped[key].down += 1;
    }

    const result = Object.values(grouped)
      .map((entry) => ({
        ...entry,
        diff: entry.down - entry.up,
      }))
      .filter((entry) => entry.diff > 0)
      .sort((a, b) => b.diff - a.diff)
      .map((entry, index) => ({
        rank: index + 1,
        plate: entry.plate,
        province: entry.province,
        down: entry.down,
        diff: entry.diff,
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in /api/rating/worst:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
