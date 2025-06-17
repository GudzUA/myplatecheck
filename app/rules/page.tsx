"use client";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

export default function RulesPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-gray-900">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">
        📜 {t.rules_title}
      </h1>
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none whitespace-pre-line">
        {t.rules_full}
      </div>
    </main>
  );
}
