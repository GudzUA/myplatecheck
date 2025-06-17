"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

export default function DonateButton() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <Link
      href="https://www.buymeacoffee.com/myplatecheck" // заміни за потреби
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-center text-lg font-bold text-blue-800 bg-yellow-400 hover:bg-yellow-500 font-semibold py-2 px-4 rounded shadow transition mb-4"
    >
      ☕ {t.donate}
    </Link>
  );
}
