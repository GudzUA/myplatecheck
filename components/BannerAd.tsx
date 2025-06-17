"use client";

import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import Image from "next/image";
import Link from "next/link";

const BannerAd = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="w-full bg-transparent px-4 py-4">
      <div className="max-w-screen-xl mx-auto">
        <Link href="/upgrade">
          <Image
            src="/ads/add.png"
            alt={t.advert}
            width={1400}
            height={70}
            className="w-full object-contain rounded shadow-md cursor-pointer"
/>
        </Link>
      </div>
    </div>
  );
};

export default BannerAd;
