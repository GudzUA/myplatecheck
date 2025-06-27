import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, plate } = await req.json();

  if (!email || !plate) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.pro) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updatedPlates =
  Array.isArray(user.trackedPlates) && user.trackedPlates.every(p => typeof p === "string")
    ? user.trackedPlates.filter(
        (p) => p !== plate.toUpperCase().replace(/\s+/g, "")
      )
    : [];

    const updated = await prisma.user.update({
      where: { email },
      data: { trackedPlates: updatedPlates },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Remove error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
