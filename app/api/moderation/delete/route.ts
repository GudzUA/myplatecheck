import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id } = await req.json();
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
