"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function DrawInfoPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        🎁 {t.draw_title}
      </h1>

      <p className="text-lg text-gray-700 mb-4 whitespace-pre-line">
        {t.draw_intro}
      </p>

      <p className="text-3xl text-red-500 italic mb-6">
        📅 {t.draw_period}
      </p>

      <div className="text-left bg-blue-50 p-6 rounded-xl border border-blue-200 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          🔹 {t.draw_daily_prizes}
        </h2>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-5 mb-10">
        <h3 className="text-xl font-bold text-yellow-800">
          ❄️ {t.draw_grand_prize}
        </h3>
      </div>

      <div className="text-left bg-gray-100 p-6 rounded-xl border border-gray-300">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">
          📌 {t.draw_conditions}
        </h2>
        <p className="mt-4 italic text-gray-600">
          🛡️ {t.draw_note}
        </p>
      </div>
    </main>
  );
}
