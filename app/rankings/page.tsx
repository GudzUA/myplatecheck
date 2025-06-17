"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

type RatingData = {
  plate: string;
  province: string;
  dislikes: number;
};

type Comment = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  media?: { url: string; type: string }[];
};

export default function RatingPage() {
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const commentKeys = Object.keys(localStorage).filter(key => key.startsWith("rating-"));
    const commentData: Record<string, { plate: string; province: string; down: number }> = {};

    for (const key of commentKeys) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const commentId = key.replace("rating-", "");
        const commentEntry = localStorage.getItem("comments");
        if (commentEntry) {
          const parsedComments = JSON.parse(commentEntry);
          const comment = (parsedComments as Comment[]).find((c) => c.id === commentId);
          if (comment) {
            const plate = comment.plate;
            if (!commentData[plate]) {
              commentData[plate] = { plate, province: comment.province, down: 0 };
            }
            commentData[plate].down += parsed.down || 0;
          }
        }
      } catch {
        console.warn("Invalid rating entry:", key);
      }
    }

    const result = Object.values(commentData)
      .filter((item) => item.down > 0)
      .sort((a, b) => b.down - a.down)
      .map((item) => ({
        plate: item.plate,
        province: item.province,
        dislikes: item.down,
      }));

    setRatings(result);
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">{t.worst_drivers_title}</h1>

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
      const plateImage = `/img/${item.province.toLowerCase().replace(/[^\w]/g, "")}-plate.png`;

      return (
        <tr key={item.plate} className="border-t hover:bg-blue-50 transition">
          <td className="py-3 px-4 font-medium">{index + 1}</td>
          <td className="py-3 px-4">
            <Link href={`/plate/${item.province.toLowerCase().replace(/\s+/g, "")}/${item.plate}`}>
              <div className="relative w-[90px] h-[45px]">
                <Image
                  src={plateImage}
                  alt={`Номер ${item.plate}`}
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
