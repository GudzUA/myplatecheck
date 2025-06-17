
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PlateRatingBlock from "../../../components/PlateRatingBlock";
import { getEmbedHTML } from "../../../utils/embed";
import parse from "html-react-parser";
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../translations";

// Тип для медіа-файлів (зображення або відео)
type MediaItem = {
  url: string;
  type: string;
};

// Тип для коментаря
type CommentData = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  media?: MediaItem[];
  videoUrl?: string;
  votes?: number;
};

// Компонент сторінки провінції
export default function ProvincePage() {
  const { province } = useParams() as { province: string }; // <-- правильне витягування
  const rawProvince = province || "";

  const { lang } = useLanguage();
  const t = translations[lang];
  const [comments, setComments] = useState<CommentData[]>([]);
  const [clientDates, setClientDates] = useState<Record<string, string>>({});
  const cleaned = rawProvince.replace(/[^\w]/gi, "").toLowerCase();
  const provinceSlug = decodeURIComponent(cleaned);

  useEffect(() => {
    const stored = localStorage.getItem("comments");
    if (!stored) return;

    const all: CommentData[] = JSON.parse(stored);
    const filtered = all.filter(
      (c) => (c.province || "").toLowerCase().replace(/[^\w]/gi, "") === provinceSlug
    );

          setComments(filtered); 

const dateMap: Record<string, string> = {};
for (const c of filtered) {
  dateMap[c.id] = new Date(c.createdAt).toLocaleDateString();
}
setClientDates(dateMap);
  }, [provinceSlug]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">{t.comments_for}: {provinceSlug}</h1>

      {comments.length === 0 ? (
        <p className="text-gray-500 italic">{t.no_province_comments}</p>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => {
            const plateImage = `/img/${c.province.toLowerCase().replace(/[^\w]/gi, "")}-plate.png`;
            const urlMatch = c.videoUrl || c.comment?.match(/https?:\/\/[^\s]+/)?.[0];
            const embed = urlMatch ? getEmbedHTML(urlMatch) : null;

            return (
              <div
                key={c.id}
                className="bg-white border border-blue-200 rounded-xl shadow-md p-5 space-y-3 hover:shadow-lg transition"
              >
                <Link href={`/plate/${encodeURIComponent(c.province.toLowerCase().replace(/[^\w]/gi, ""))}/${c.plate}`}>
                  <div className="text-sm text-gray-500 text-right mb-1">
                    <strong>{c.author || t.anonymous}</strong> · <strong>{c.province}</strong> · {clientDates[c.id] || ""}
                  </div>
                  <div className="relative inline-block w-[180px] h-[90px]">
<Image
  src={plateImage}
  alt={`${t.plate_alt} ${c.plate}`}
  width={180}
  height={90}
  className="w-full h-full object-contain"
/>
                    <span className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[26px] font-bold tracking-[0.015em] text-blue-900 drop-shadow scale-y-125">
                      {c.plate}
                    </span>
                  </div>
                  <p className="text-base text-gray-800 mt-2">{c.comment}</p>
                  {embed && <div className="mt-2">{parse(embed)}</div>}
                  {c.media?.[0]?.url && (
                    c.media[0].type.startsWith("video") ? (
                      <video
                        src={c.media[0].url}
                        controls
                        className="w-[200px] h-auto rounded mt-2"
                      />
                    ) : (
<Image
  src={c.media[0].url}
  alt={t.added_image}
  width={200}
  height={150}
  className="rounded mt-2 object-cover"
/>
                    )
                  )}
                </Link>
                <div className="flex justify-end"><PlateRatingBlock plate={c.plate} /></div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
