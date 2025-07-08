import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ids, lang } = await req.json();

  if (!Array.isArray(ids) || !lang) {
    return NextResponse.json({ translations: [] });
  }

  const translations = await prisma.commentTranslation.findMany({
    where: {
      commentId: { in: ids },
      language: lang,
    },
    select: {
      commentId: true,
      text: true,
    },
  });

  return NextResponse.json({ translations });
}
