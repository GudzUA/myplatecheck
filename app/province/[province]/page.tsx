"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RatingBlock from "../../../components/RatingBlock";
import { getEmbedHTML } from "../../../utils/embed";
import parse from "html-react-parser";
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../translations";
import BadgeList from "../../../components/BadgeList";
import TranslatedComment from "../../../components/TranslatedComment";
import { provinceAbbreviations } from "@/utils/provinceAbbreviations";
import { TranslationsProvider } from "@/context/TranslationsContext";
import { useRef } from "react";


type RatingData = {
  up: number;
  down: number;
  userVote?: "up" | "down";
};

type CommentData = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  media?: { url: string; type: string }[];
  videoUrl?: string;
  author: string;
  badges?: string[];
  email?: string;
  language: string;
};


export default function ProvincePage() {
  const { province } = useParams() as { province: string };
  const rawProvince = province || "";
  const { lang } = useLanguage();
  const t = translations[lang];

  const [comments, setComments] = useState<CommentData[]>([]);
  const [clientDates, setClientDates] = useState<Record<string, string>>({});
  const cleaned = rawProvince.replace(/[^\w]/gi, "").toLowerCase();
  const provinceSlug = decodeURIComponent(cleaned);
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});
  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const parsed = stored ? JSON.parse(stored) : null;
  const email = parsed?.email || "guest";
  const finalEmail = email === "guest" ? `guest-${provinceSlug}@myplatecheck.com` : email;
  const [translationsMap, setTranslationsMap] = useState<Record<string, Record<string, string>>>({});

const fetchedLangsRef = useRef<Set<string>>(new Set());

useEffect(() => {
  async function fetchAll() {
    try {
      const res = await fetch(`/api/comments?province=${provinceSlug}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Невірна відповідь з API:", data);
        return;
      }

      setComments(data);

      // 🕒 Дати
      const dateMap: Record<string, string> = {};
      for (const c of data) {
        dateMap[c.id] = new Date(c.createdAt).toLocaleDateString();
      }
      setClientDates(dateMap);

      const commentIds = data.map((c: CommentData) => c.id).filter(id => !!id);

      // 👍 Рейтинг
      const ratingRes = await fetch("/api/comment-rating/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentIds, email: finalEmail }),
      });
      const ratingData = await ratingRes.json();
      setRatings(ratingData);

    } catch (err) {
      console.error("❌ ProvincePage fetchAll error:", err);
    }
  }

  fetchAll();
}, [provinceSlug, lang]);

useEffect(() => {
  const untranslated = comments.filter((c) => c.language !== lang);
  if (untranslated.length === 0) return;

  if (fetchedLangsRef.current.has(lang)) return; // ✅ вже був запит для цієї мови

  const ids = untranslated.map((c) => c.id);

  fetch("/api/translate/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, lang }),
  })
    .then((res) => res.json())
    .then(async (data: { translations: { commentId: string; text: string }[] }) => {
      const batchMap: Record<string, string> = {};
      for (const { commentId, text } of data.translations) {
        batchMap[commentId] = text;
      }

      setTranslationsMap((prev) => ({
        ...prev,
        [lang]: {
          ...(prev[lang] || {}),
          ...batchMap,
        },
      }));

      fetchedLangsRef.current.add(lang); // ✅ відмічаємо, що завантажили

      const missing = untranslated.filter((c) => !batchMap[c.id]);
      if (missing.length === 0) return;

      const items = missing.map((c) => ({
        commentId: c.id,
        text: c.comment,
        language: c.language,
      }));

      const resLive = await fetch("/api/translate/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, lang }),
      });

      const liveData = await resLive.json();

      const liveMap: Record<string, string> = {};
      for (const { id, text } of liveData.translations) {
        liveMap[id] = text;
      }

      if (Object.keys(liveMap).length > 0) {
        setTranslationsMap((prev) => ({
          ...prev,
          [lang]: {
            ...(prev[lang] || {}),
            ...liveMap,
          },
        }));
      }
    })
    .catch((err) => console.error("❌ Batch+Live error", err));
}, [comments, lang]);


  return (
  <TranslationsProvider translations={translationsMap[lang] || {}}>
    <main className="w-full px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 capitalize">
          {t.comments_for}: {cleaned}
        </h1>

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
                  className="bg-white border border-blue-200 rounded-xl shadow-md p-3 space-y-2 hover:shadow-2x1 transition"
                >
                  <Link href={`/plate/${encodeURIComponent(c.province.toLowerCase().replace(/[^\w]/gi, ""))}/${c.plate}`}>
                    <div className="text-sm text-gray-500 text-right mb-1 flex items-center justify-end gap-2">
                      <span className="flex items-center gap-2">
                        <BadgeList badges={c.badges || []} />
                        <strong>{["Гість", "Guest", "Invité"].includes(c.author) ? t.anonymous : c.author}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                        {provinceAbbreviations[c.province.toLowerCase()] || c.province}
                      </span> · {clientDates[c.id] || ""}
                    </div>

                    <div className="relative inline-block w-[110px] h-[55px] sm:w-[150px] sm:h-[75px]">
                      <Image
                        src={plateImage}
                        alt={`Номер ${c.plate}`}
                        width={180}
                        height={90}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[15px] sm:text-[21px] font-bold tracking-[0.015em] text-blue-900 drop-shadow scale-y-125">
                          {c.plate}
                        </span>
                      </div>
                    </div>

                    <div className="max-h-[4.5em] overflow-hidden text-ellipsis">
                      <TranslatedComment id={c.id} originalText={c.comment} />
                    </div>

                    {embed && <div className="mt-2">{parse(embed)}</div>}

                    {Array.isArray(c.media) && c.media.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-2">
                        {c.media.map((item, idx) => {
                          if (!item?.type || !item?.url) return null;

                          return item.type.startsWith("video") ? (
                            <video
                              key={idx}
                              src={item.url}
                              controls
                              className="w-[200px] h-auto rounded"
                            />
                          ) : (
                            <Image
                              key={idx}
                              src={item.url}
                              alt={t.added_image}
                              width={200}
                              height={150}
                              className="rounded object-cover"
                            />
                          );
                        })}
                      </div>
                    )}
                  </Link>

                  <div className="flex justify-end">
                    <RatingBlock commentId={c.id} allRatings={ratings} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  </TranslationsProvider>
);
