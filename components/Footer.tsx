"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

export default function Footer() {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <footer className="text-center text-sm text-white py-4 mt-auto bg-blue-900">
      © 2025 MyPlateCheck |{" "}
      <Link href="/rules" className="underline hover:text-blue-300">{t.rules}</Link>
       {" "}
      |{" "}
      <Link href="/contact" className="underline hover:text-blue-300">{t.contact}</Link>
       {" "}
      |{" "}
      <Link href="/about" className="underline hover:text-blue-300">{t.about}</Link>
    </footer>
  );
}
