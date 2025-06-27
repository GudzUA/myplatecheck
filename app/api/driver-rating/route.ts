// app/api/driver-rating/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { plate, email, type, province } = await req.json();

    if (!plate || !email || !type || !province) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Перевіряємо, чи вже є голос від цього користувача на цей plate + province
    const existing = await prisma.driverRating.findUnique({
      where: {
        plate_province_email: {
          plate,
          province,
          email,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }

    // Додаємо голос
    await prisma.driverRating.create({
      data: {
        plate,
        province,
        email,
        type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Driver rating error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const plate = searchParams.get("plate");
    const email = searchParams.get("email") || "guest";
    const province = searchParams.get("province");

    if (!plate || !province) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const allRatings = await prisma.driverRating.findMany({
      where: { plate, province },
    });

    const userRating = await prisma.driverRating.findUnique({
      where: {
        plate_province_email: {
          plate,
          province,
          email,
        },
      },
    });

    const up = allRatings.filter((r) => r.type === "up").length;
    const down = allRatings.filter((r) => r.type === "down").length;

    return NextResponse.json({
      up,
      down,
      userVote: userRating?.type || null,
    });
  } catch (error) {
    console.error("Load driver rating error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
