import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { prisma } from "@/lib/prisma";

interface Props {
  id: string;
  text: string;
}

export function useTranslatedComment({ id, text }: Props) {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || !lang || lang === "UA") {
      setTranslated(text);
      return;
    }

    const fetchTranslation = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commentId: id,         // ✅ правильно: очікується на бекенді
            text: text,
            language: lang,        // ✅ правильно: очікується на бекенді
          }),
        });

        if (!res.ok) {
          console.error("Translation error:", res.statusText);
          return;
        }

        const data = await res.json();
        setTranslated(data.translation || text);
      } catch (err) {
        console.error("Translation fetch failed:", err);
        setTranslated(text);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [id, text, lang]);

  return { translated, loading };
}
