import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // адаптуй шлях до твого
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Invalid JSON input:", err);
    return NextResponse.json({ error: "Invalid JSON input" }, { status: 400 });
  }

  const { commentId, text, language } = body;

  if (!commentId || !text || !language) {
    return NextResponse.json({ error: "Missing commentId, text, or language" }, { status: 400 });
  }

  try {
    // 🟢 1. Перевіряємо, чи вже є такий переклад у базі
    const existing = await prisma.commentTranslation.findFirst({
      where: { commentId, language },
    });

    if (existing) {
      return NextResponse.json({ translation: existing.text });
    }

    // 🟡 2. Якщо немає — запит до OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Ти — помічник для перекладу. Перекладай лише **дослівно**, без додавання пояснень, тлумачень, вигадування чи покращення. Просто переклади слово в слово те, що надіслав користувач.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translated = response.choices[0]?.message?.content ?? "";

    // 🔵 3. Зберігаємо в базу (через create — якщо унікальний)
 const existingTranslation = await prisma.commentTranslation.findFirst({
  where: { commentId, language },
});

if (existingTranslation) {
  await prisma.commentTranslation.update({
    where: { id: existingTranslation.id },
    data: { text: translated },
  });
} else {
  await prisma.commentTranslation.create({
    data: {
      commentId,
      language,
      text: translated,
    },
  });
}

    return NextResponse.json({ translation: translated });
  } catch (err) {
    console.error("❌ Translation failed:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
