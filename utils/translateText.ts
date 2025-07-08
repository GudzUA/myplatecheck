// /utils/translateText.ts

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function translateText(text: string, targetLang: string): Promise<string> {
  const prompt = `Translate the following comment into ${targetLang.toUpperCase()}:\n\n${text}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const result = completion.choices[0]?.message?.content?.trim();
  return result || text;
}
