"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

type RatingData = {
  plate: string;
  province?: string | null;
  dislikes: number;
};

export default function RatingPage() {
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/rating/worst");
        if (!res.ok) return;
        const data = await res.json();
        setRatings(data);
      } catch (err) {
        console.error("Failed to load rating data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">
        {t.worst_drivers_title}
      </h1>

      {ratings.length === 0 ? (
        <p className="text-gray-600 italic text-center mt-4 text-lg">{t.no_votes_yet}</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow-md text-sm overflow-hidden">
          <thead className="bg-blue-100 text-blue-900 uppercase text-xs tracking-wide">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">{t.plate_column}</th>
              <th className="py-3 px-4 text-left">{t.dislikes_column}</th>
            </tr>
          </thead>
          <tbody>
{ratings.map((item, index) => {
  const slug = (item.province ?? "").toLowerCase().replace(/[^\w]/g, "");
  const plateImage = `/img/${slug}-plate.png`;

  return (
    <tr key={item.plate} className="border-t hover:bg-blue-50 transition">
      <td className="py-3 px-4 font-medium">{index + 1}</td>
      <td className="py-3 px-4">
        <Link href={`/plate/${slug}/${item.plate}`}>
          <div className="relative w-[90px] h-[45px]">
            <Image
              src={plateImage}
              alt={`${item.province} plate`}
              width={90}
              height={45}
              className="object-contain w-full h-full shadow-sm rounded"
            />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold tracking-wide text-blue-900 scale-y-110">
              {item.plate}
            </span>
          </div>
        </Link>
      </td>
      <td className="py-3 px-4 font-semibold text-red-600">{item.dislikes}</td>
    </tr>
  );
})}

          </tbody>
        </table>
      )}
    </main>
  );
}