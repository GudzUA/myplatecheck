import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, plate } = await req.json();

  if (!email || !plate) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const formatted = plate.toUpperCase().replace(/\s+/g, "");
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

if (!user) {
}

    if (!user || !user.pro) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const plates: string[] =
  Array.isArray(user.trackedPlates) && user.trackedPlates.every(p => typeof p === "string")
    ? user.trackedPlates
    : [];

    if (plates.includes(formatted)) {
      return NextResponse.json({ error: "plate_exists" }, { status: 400 });
    }

    if (plates.length >= 4) {
      return NextResponse.json({ error: "plate_limit" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        trackedPlates: [...plates, formatted],
      },
    });

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
