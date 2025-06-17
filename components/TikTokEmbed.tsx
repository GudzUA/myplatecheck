"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { getEmbedHTML } from "../utils/embed";

async function expandTikTokUrl(shortUrl: string): Promise<string> {
  try {
    console.log("[TikTok] Починаємо розширення URL:", shortUrl);
    const res = await fetch(`/api/expand-tiktok?url=${encodeURIComponent(shortUrl)}`);
    const data = await res.json();
    console.log("[TikTok] Результат API:", data);
    return data.fullUrl || shortUrl;
  } catch (error) {
    console.error("[TikTok] Помилка при розширенні TikTok URL:", error);
    return shortUrl;
  }
}

type Props = {
  url: string;
};

export default function TikTokEmbed({ url }: Props) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    async function process() {
      console.log("[TikTok] Вхідний URL:", url);
      const full = await expandTikTokUrl(url);
      console.log("[TikTok] Повний URL після редиректу:", full);

      const embed = getEmbedHTML(full);
      console.log("[TikTok] Згенерований embed:", embed);

      if (embed) setHtml(embed);
      else console.warn("[TikTok] Embed HTML не згенерований");
    }

    process();
  }, [url]);

  useEffect(() => {
    if (!html) return;
    console.log("[TikTok] Вставляємо скрипт TikTok");
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    script.onload = () => console.log("[TikTok] Скрипт завантажено");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [html]);

  if (!html) {
    console.log("[TikTok] Очікуємо на HTML...");
    return null;
  }

  return <div className="mt-2">{parse(html)}</div>;
}
