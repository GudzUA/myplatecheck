import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.driverRating.groupBy({
      by: ["plate", "province"],
      where: {
        type: "down",
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json(
      result.map((item) => ({
        plate: item.plate,
        province: item.province,
        dislikes: item._count.id,
      }))
    );
  } catch (error) {
    console.error("Error in top-worst route:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
