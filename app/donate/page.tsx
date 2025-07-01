"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function DonatePage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleStripeDonate = async (priceId: string) => {
    const res = await fetch("/api/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Помилка при створенні сесії Stripe");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        {t.donate_title}
      </h1>
      <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
        {t.donate_text}
      </p>
      <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
        {t.donate_note}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
  <button
    onClick={() => handleStripeDonate("price_1RfoXtKa6qWouAJyovNhrAIA")}
    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold py-3 px-6 rounded-full shadow whitespace-nowrap"
  >
    {t.donate_amount_5}
  </button>
  <button
    onClick={() => handleStripeDonate("price_1RfobDKa6qWouAJyxwpeBIFB")}
    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold py-3 px-6 rounded-full shadow whitespace-nowrap"
  >
    {t.donate_amount_10}
  </button>
  <button
    onClick={() => handleStripeDonate("price_1RfobZKa6qWouAJyemjJFCgz")}
    className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold py-3 px-6 rounded-full shadow whitespace-nowrap"
  >
    {t.donate_amount_20}
  </button>
</div>
    </main>
  );
}
