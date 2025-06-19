
// app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { franc } from "franc";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type CacheEntry = {
  original: string;
  lang: string;
  translated: string;
};

const translationCache: CacheEntry[] = [];

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
    }

    // Перевірка мови оригіналу — якщо вже EN, не перекладаємо
    const detectedLang = franc(text);
    if ((targetLang === "EN" && detectedLang === "eng") ||
        (targetLang === "FR" && detectedLang === "fra") ||
        (targetLang === "UA" && detectedLang === "ukr")) {
      return NextResponse.json({ success: true, translated: text });
    }

    // Кешування
    const cached = translationCache.find(
      (entry) => entry.original === text && entry.lang === targetLang
    );
    if (cached) {
      return NextResponse.json({ success: true, translated: cached.translated });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that translates short user comments into the requested language.",
        },
        {
          role: "user",
          content: `Translate this into ${targetLang === "FR" ? "French" : targetLang === "UA" ? "Ukrainian" : "English"}:

${text}`,
        },
      ],
      temperature: 0.3,
    });

    const translated = response.choices[0]?.message?.content?.trim() || text;

    // Додаємо в кеш
    translationCache.push({ original: text, lang: targetLang, translated });

    return NextResponse.json({ success: true, translated });
  } catch (err) {
    console.error("❌ Translate API error:", err);
    return NextResponse.json({ success: false, error: "translation_failed" }, { status: 500 });
  }
}
