"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import RatingBlock from "../components/RatingBlock";
import Image from "next/image";
import parse from "html-react-parser";
import BannerAd from "../components/BannerAd";
import NextImage from "next/image";
import DonateButton from "../components/DonateButton";
import BadgeList from "../components/BadgeList";
import TranslatedComment from "../components/TranslatedComment";
import { provinceAbbreviations } from "@/utils/provinceAbbreviations";
import { TranslationsProvider } from "@/context/TranslationsContext";
import { useRef } from "react";
import { getFinalEmail } from "@/utils/getFinalEmail";


type MediaItem = {
  url: string;
  type: string;
};

type Comment = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  media?: MediaItem[];
  votes?: number;
  parentId?: string;
  author?: string;
  email?: string; 
  pending?: boolean;
  badges?: string[];
  videoUrl?: string; // ✅ нове поле для YouTube / TikTok
  language: string;

};

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [worstDrivers, setWorstDrivers] = useState<{ plate: string; province: string; dislikes: number }[]>([]);
  const [userType, setUserType] = useState<"guest" | "free" | "pro">("guest");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [clientDates, setClientDates] = useState<Record<string, string>>({});
  const [embedHtmlMap, setEmbedHtmlMap] = useState<Record<string, string | null>>({});
  const [ratings, setRatings] = useState<Record<string, { up: number; down: number }>>({});
  const [translationsMap, setTranslationsMap] = useState<Record<string, Record<string, string>>>({});


  const COMMENTS_PER_PAGE = 7;

const monthNames = {
  UA: [ "січень", "лютий", "березень", "квітень", "травень", "червень",
        "липень", "серпень", "вересень", "жовтень", "листопад", "грудень" ],
  EN: [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ],
  FR: [ "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre" ]
};

const now = new Date();
const currentMonth = monthNames[lang][now.getMonth()];
const fetchedLangsRef = useRef<Set<string>>(new Set());

  const start = (currentPage - 1) * COMMENTS_PER_PAGE;
  const end = start + COMMENTS_PER_PAGE;
  const paginatedComments = comments.slice(start, end);

function getEmbedHTML(url: string): string | null {
  if (!url) return null;

  // ✅ TikTok (адаптивно)
  if (url.includes("tiktok.com")) {
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match?.[1];
    if (!videoId) return null;

    return `
      <div style="max-width: 100%; overflow: hidden;">
        <blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="width: 100%; min-width: 200px;">
          <section></section>
        </blockquote>
      </div>
    `;
  }

  // ✅ YouTube (адаптивно)
  if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      return `
        <div style="position: relative; width: 100%; padding-top: 56.25%;">
          <iframe 
            src="https://www.youtube.com/embed/${match[1]}"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }
  }

  // ✅ Facebook (адаптивно)
  if (url.includes("facebook.com") && url.includes("video")) {
    const encodedUrl = encodeURIComponent(url);
    return `
      <div style="position: relative; width: 100%; padding-top: 56.25%;">
        <iframe 
          src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; overflow: hidden;"
          scrolling="no"
          frameborder="0"
          allowfullscreen="true"
        ></iframe>
      </div>
    `;
  }

  // ✅ Instagram (адаптивно)
  if (url.includes("instagram.com/p/")) {
    return `
      <div style="max-width: 100%; overflow: hidden;">
        <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="width: 100%;">
        </blockquote>
      </div>
    `;
  }

  return null;
}

useEffect(() => {
  const untranslated = paginatedComments.filter((c) => c.language !== lang);
  if (untranslated.length === 0) return;

  if (fetchedLangsRef.current.has(lang)) return; 

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

      fetchedLangsRef.current.add(lang); 

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
}, [paginatedComments, lang]);


useEffect(() => {
async function fetchComments() {
  try {
    const res = await fetch("/api/comments");
    const data: Comment[] = await res.json();

    const filtered = data.filter((c) => !c.parentId && !c.pending);

    const recent = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setComments(recent);

    // Дати для клієнтського форматування
    const dateMap: Record<string, string> = {};
    for (const c of recent) {
      dateMap[c.id] = new Date(c.createdAt).toLocaleDateString();
    }
    setClientDates(dateMap);

    // Витягуємо всі відео-посилання з comment + videoUrl
    const embedMap: Record<string, string | null> = {};
    for (const c of recent) {
      const rawText = [c.comment, c.videoUrl].filter(Boolean).join(" ");
      const urls = [...rawText.matchAll(/https?:\/\/\S+/g)];
      const embeds = urls.map(match => getEmbedHTML(match[0])).filter(Boolean);
      embedMap[c.id] = embeds.length > 0 ? embeds.join("<br/>") : null;
    }
    setEmbedHtmlMap(embedMap);

    // Найгірші водії за дизлайками
// Замість localStorage — запит до API
const resWorst = await fetch("/api/comment-rating/top-worst");
const worst: { plate: string; province: string; dislikes: number }[] = await resWorst.json();
setWorstDrivers(worst);

  } catch (error) {
    console.error("❌ Помилка при завантаженні коментарів з бази:", error);
  }
}
  fetchComments();
}, []);

useEffect(() => {
  const hasTikTok = Object.values(embedHtmlMap).some(html => html?.includes("tiktok-embed"));
  if (!hasTikTok) return;

  const existingScript = document.querySelector("script[src='https://www.tiktok.com/embed.js']");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }

  const tryReload = () => {
    const api = window as unknown as { tiktokEmbedLoad?: () => void };
    if (api.tiktokEmbedLoad) {
      api.tiktokEmbedLoad();
    } else {
      setTimeout(tryReload, 200);
    }
  };

  tryReload();
}, [embedHtmlMap]);

useEffect(() => {
  const hasInstagram = Object.values(embedHtmlMap).some(html => html?.includes("instagram-media"));
  if (!hasInstagram) return;

  const existingScript = document.querySelector("script[src='https://www.instagram.com/embed.js']");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }

  const tryReload = () => {
    const api = window as unknown as {
      instgrm?: {
        Embeds?: {
          process?: () => void;
        };
      };
    };

    if (api.instgrm?.Embeds?.process) {
      api.instgrm.Embeds.process();
    } else {
      setTimeout(tryReload, 200);
    }
  };

  tryReload();
}, [embedHtmlMap]);


useEffect(() => {
  async function fetchRatings() {
    const commentIds = comments.map((c) => c.id);
    if (commentIds.length === 0) return;

    try {
      const email = getFinalEmail(); 

      const res = await fetch("/api/comment-rating/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentIds, email }),
      });

      const data = await res.json();
      setRatings(data);
    } catch (err) {
      console.error("Rating fetch error", err);
    }
  }

  fetchRatings();
}, [comments]);


useEffect(() => {
  let user = localStorage.getItem("user");
    if (!user) {
  const guestId = `guest_${crypto.randomUUID()}@myplatecheck.com`;
  user = JSON.stringify({ email: guestId, type: "guest" });
  localStorage.setItem("user", user);
}

  try {
    const parsed = JSON.parse(user);
    const type = parsed?.type || (parsed?.pro ? "pro" : "free");
    setUserType(type);

    if (parsed?.email) {
      const email = parsed.email.toLowerCase();
      const rawUsers = localStorage.getItem("users");
      const users = rawUsers ? JSON.parse(rawUsers) : {};

      users[email] = {
        badges: [
          ...(parsed.pro || parsed.type === "pro" ? ["pro"] : [])
        ]
      };

      localStorage.setItem("users", JSON.stringify(users));
    }

  } catch {
    setUserType("guest");
  }
}, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
 {userType !== "pro" && <BannerAd />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="w-full lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-6">{t.latest_comments}</h2>
           <TranslationsProvider translations={translationsMap[lang] || {}}>
            <div className="space-y-4">
             {paginatedComments.map((c) => {
              const plateImage = `/img/${c.province.toLowerCase().replace(/[^\w]/gi, "")}-plate.png`;
              return (
                <div
                  key={c.id}
                  className="bg-white border border-blue-200 rounded-xl shadow-md p-3 space-y-2 hover:shadow-2x1 transition"
                >
                  <Link href={`/plate/${encodeURIComponent(c.province.toLowerCase().replace(/[^\w]/gi, ""))}/${c.plate}`}>
  <div className="text-sm text-gray-500 text-right mb-1 flex items-center justify-end gap-2">
    <span className="flex items-center gap-2">
      <BadgeList badges={c.badges || []} />
      <strong>{["Гість", "Guest", "Invité"].includes(c.author ?? "") ? t.anonymous : c.author}</strong>
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
      <span
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-800 text-[13px] sm:text-[20px] font-bold"
  style={{
    transform: "translate(-50%, -50%) scaleX(0.82) scaleY(1.35)",
    letterSpacing: "-0.03em",
    fontFamily: "'Inter', sans-serif",
    whiteSpace: "nowrap",
    maxWidth: "90%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {c.plate}
</span>
    </div>
  </div>
</Link>

{/* Виносимо переклад + embed ПОЗА Link */}
<div className="max-h-[4.5em] overflow-hidden text-ellipsis">
  <TranslatedComment id={c.id} originalText={c.comment} />
</div>


{embedHtmlMap[c.id] && (
  <div className="mt-2 w-full max-w-full overflow-hidden">
    <div className="max-w-[100%] sm:max-w-[320px] mx-auto">
      {parse(embedHtmlMap[c.id]!)}
    </div>
  </div>
)}

{Array.isArray(c.media) && c.media.length > 0 && (
  <div className="flex gap-2 mt-2 flex-wrap">
    {c.media.map((m, idx) =>
      m.type.startsWith("image") ? (
        <Image
          key={idx}
          src={m.url}
          alt={`media-${idx}`}
          width={100}
          height={100}
          className="cursor-pointer rounded hover:shadow-lg hover:scale-105 transition object-contain"
          onClick={() => setFullscreenImage(m.url)}
        />
      ) : m.type.startsWith("video") ? (
        <video
          key={idx}
          src={m.url}
          controls
          className="w-full max-w-[120px] h-auto rounded mt-2"
        />
      ) : null
    )}
  </div>
)}


                  <div className="flex justify-end"><RatingBlock commentId={c.id} allRatings={ratings} />
                  </div>
                </div>
              );
            })}
          </div>
        </TranslationsProvider>

<div className="overflow-x-auto mt-6">
  <div className="flex justify-center items-center gap-2 min-w-[300px]">
    {/* Назад */}
   <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold text-sm border ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-800 text-white hover:bg-blue-700'
          }`}
        >
          ◀
        </button>

        {Array.from({ length: Math.ceil(comments.length / COMMENTS_PER_PAGE) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm border ${
              currentPage === i + 1
                ? 'bg-white text-blue-900 border-blue-600 shadow-md'
                : 'bg-blue-800 text-white hover:bg-blue-700'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(Math.ceil(comments.length / COMMENTS_PER_PAGE), p + 1))}
          disabled={currentPage === Math.ceil(comments.length / COMMENTS_PER_PAGE)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm border ${
            currentPage === Math.ceil(comments.length / COMMENTS_PER_PAGE)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-800 text-white hover:bg-blue-700'
          }`}
        >
          ▶
        </button>

  </div>
</div>
        </div>

        <div className="mt-4 space-y-6">
  <DonateButton />
      
        <aside className="bg-white border border-blue-200 rounded-xl shadow-sm w-full self-start p-4">
  <h2 className="text-lg font-bold text-blue-900 mb-4">
  {t.worst_drivers_for} {currentMonth}
</h2>
<ol className="list-decimal list-inside space-y-2 text-blue-800 font-semibold">
  {worstDrivers.map((item, index) => (
    <li key={index} className="flex items-center justify-between">
      {index + 1} — 
      <Link
        href={`/plate/${encodeURIComponent(item.province)}/${encodeURIComponent(item.plate)}`}
        className="hover:underline ml-1"
      >
        {item.plate}
        <span className="text-gray-500 text-xs ml-1">
          ({provinceAbbreviations[item.province.toLowerCase()] || item.province})
        </span>
      </Link>
      <span>👎 {item.dislikes}</span>
    </li>
  ))}
</ol>
</aside>


{/* 🛍️ Блок мерчу */}
<aside className="bg-white border border-yellow-300 rounded-xl shadow-md p-4 space-y-2 text-center">
  <h2 className="text-lg font-bold text-blue-900">{t.shop_title || "Магазин мерчу"}</h2>
  <p className="text-sm text-gray-700">
    {t.shop_subtitle || "Офіційний мерч нашого проєкту — покажи свою підтримку!"}
  </p>
  <Link
    href="/shop"
    className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded transition mt-2"
  >
    {t.shop_now || "До магазину"}
  </Link>
</aside>
</div>

      </div>
{fullscreenImage && (
  <div
    onClick={() => setFullscreenImage(null)}
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
  >
    <NextImage
      src={fullscreenImage}
      alt="Full view"
      width={1200} // або максимальна ширина
      height={800} // або максимальна висота
      className="object-contain w-auto h-auto max-w-full max-h-full"
    />
  </div>
)}
    </main>
  );
} 