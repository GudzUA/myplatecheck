"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function DonateSuccessPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 5000); // 5 секунд

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        {t.donate_success_title}
      </h1>
      <p className="text-lg text-gray-700 mb-4">{t.donate_success_text}</p>
      <p className="text-sm text-gray-500 italic mb-6">
        {t.redirecting}
      </p>
      <button
        onClick={() => router.push("/")}
        className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
      >
        {t. back_to_home}
      </button>
    </main>
  );
}
