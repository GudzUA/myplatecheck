// /app/api/comments/count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const count = await prisma.comment.count({
    where: {
      email,
      parentId: null, // лише основні коментарі
    },
  });

  return NextResponse.json({ count });
}
