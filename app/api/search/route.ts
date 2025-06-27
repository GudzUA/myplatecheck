import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plate = searchParams.get("plate");

  if (!plate) {
    return NextResponse.json({ error: "Missing plate" }, { status: 400 });
  }

  const comment = await prisma.comment.findFirst({
    where: { plate },
    select: { province: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ province: comment.province });
}
