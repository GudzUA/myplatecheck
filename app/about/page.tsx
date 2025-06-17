
"use client";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
   <main className="max-w-3xl mx-auto px-4 py-10 text-gray-900">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">
        📜 {t.about_title}
      </h1>
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none whitespace-pre-line">
        <p>{t.about_intro}</p>
        <p>{t.about_fuul}</p>
      </div>
    </main>
  );
}
