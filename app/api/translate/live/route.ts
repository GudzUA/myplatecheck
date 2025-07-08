import { prisma } from "@/lib/prisma";
import { translateText } from "@/utils/translateText";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { items, lang } = await req.json();

  if (!items?.length || !lang) {
    return NextResponse.json({ translations: [] });
  }

  const translations = await Promise.all(
    items.map(async ({ commentId, text, language }: { commentId: string; text: string; language: string }) => {
      if (language === lang) return { id: commentId, text }; // ❌ не перекладаємо на ту саму мову

      const translated = await translateText(text, lang);

      const existing = await prisma.commentTranslation.findFirst({
        where: { commentId, language: lang },
      });

      if (existing) {
        await prisma.commentTranslation.update({
          where: { id: existing.id },
          data: { text: translated },
        });
      } else {
        await prisma.commentTranslation.create({
          data: {
            commentId,
            language: lang,
            text: translated,
          },
        });
      }

      return { id: commentId, text: translated };
    })
  );

  return NextResponse.json({ translations });
}
