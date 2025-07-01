"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function DonateSuccessPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        {t.donate_success_title }
      </h1>
      <p className="text-lg text-gray-700">
        {t.donate_success_text}
      </p>
    </main>
  );
}
