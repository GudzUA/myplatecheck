"use client";

import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import Image from "next/image";

const BannerAd = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  const handlePromoClick = async () => {
    try {
      const res = await fetch("/api/stripe/checkout-promo", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // ⬅️ редірект на Stripe
      } else {
        alert("⚠️ Не вдалося перейти до оплати.");
      }
    } catch (e) {
      console.error("❌ Promo banner error", e);
      alert("⚠️ Сталася помилка при переході.");
    }
  };

  return (
    <div className="w-full bg-transparent px-4 py-4">
      <div className="max-w-screen-xl mx-auto">
        <button onClick={handlePromoClick} className="w-full">
          <Image
            src="/ads/add.png"
            alt={t.advert}
            width={1400}
            height={70}
            className="w-full object-contain rounded shadow-md cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
};

export default BannerAd;

