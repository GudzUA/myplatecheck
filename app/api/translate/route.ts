import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
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

  // ⛔️ Захист: не перекладаємо на ту ж мову, з якої був оригінал
  const originalComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { sourceLang: true },
  });

  if (!originalComment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (originalComment.sourceLang === language) {
    return NextResponse.json({ translation: text });
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
          content: `Ти — помічник для перекладу. Перекладай лише дослівно, без додавання пояснень, тлумачень, вигадування чи покращення. Переклади текст з мови оригіналу на ${language === "FR" ? "французьку" : language === "EN" ? "англійську" : "українську"}.`,
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
