"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function TranslatedComment({
  text,
}: {
  text: string;
}) {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    if (lang === "ua") return; // 🔹 Не перекладати, якщо мова — українська

    const fetchTranslation = async () => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang: lang }),
        });
        const data = await res.json();
        if (data.translated) {
          setTranslated(data.translated);
        }
      } catch {
        setTranslated(""); // fallback
      }
    };

    fetchTranslation();
  }, [lang, text]);

  if (lang === "ua") {
    return <p className="text-base text-gray-800 mt-2">{text}</p>;
  }

  return (
    <div className="text-base text-gray-800 mt-2">
      <p>{showOriginal || !translated ? text : translated}</p>
      {translated && (
        <button
          onClick={() => setShowOriginal((prev) => !prev)}
          className="text-xs underline text-blue-700 mt-1"
        >
          {showOriginal ? "Show Translation" : "Показати оригінал"}
        </button>
      )}
    </div>
  );
}
