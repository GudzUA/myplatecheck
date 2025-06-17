"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import PlateRatingBlock from "../components/PlateRatingBlock";
import Image from "next/image";
import { getEmbedHTML } from "../utils/embed";
import parse from "html-react-parser";
import BannerAd from "../components/BannerAd";
import NextImage from "next/image";
import TikTokEmbed from "../components/TikTokEmbed";
import DonateButton from "../components/DonateButton";
import BadgeList from "../components/BadgeList";
import TranslatedComment from "../components/TranslatedComment";


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
};

type User = {
  email?: string;
  badges?: string[];
  pro?: boolean;
};

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [worstDrivers, setWorstDrivers] = useState<string[]>([]);
  const [userType, setUserType] = useState<"guest" | "free" | "pro">("guest");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [clientDates, setClientDates] = useState<Record<string, string>>({});
  const [embedHtmlMap, setEmbedHtmlMap] = useState<Record<string, string | null>>({});


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

  const start = (currentPage - 1) * COMMENTS_PER_PAGE;
  const end = start + COMMENTS_PER_PAGE;
  const paginatedComments = comments.slice(start, end);

const expandTikTokUrl = async (url: string): Promise<string> => {
  try {
    const res = await fetch(`/api/expand-tiktok?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.fullUrl || url;
  } catch {
    return url;
  }
};


useEffect(() => {
  const processEmbeds = async () => {
    for (const c of paginatedComments) {
      if (!c.comment || typeof c.comment !== "string") continue;
      const urlMatch = c.comment.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) continue;

      let finalUrl = urlMatch[0];

      if (finalUrl.includes("facebook.com/share/r/")) {
        try {
          const res = await fetch("/api/expand-facebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shortUrl: finalUrl }),
          });
          const data = await res.json();
          finalUrl = data.fullUrl || finalUrl;
        } catch {}
      }
    if (finalUrl.includes("vm.tiktok.com")) {
      try {
        finalUrl = await expandTikTokUrl(finalUrl);
      } catch {}
    }

      const embed = getEmbedHTML(finalUrl);
      if (embed) {
        setEmbedHtmlMap((prev) => ({ ...prev, [c.id]: embed }));
      }
    }
  };

  processEmbeds();
}, [paginatedComments]);

//⬇️ ДОДАЙ ОЦЕ ПІСЛЯ ТОГО useEffect
useEffect(() => {
  console.log("✅ embedHtmlMap", embedHtmlMap);

  if (typeof window !== "undefined") {
    try {
      (window as any).tiktokEmbedLoad?.();
      (window as any).tiktok?.load?.(); // ⬅️ fallback для нового API
    } catch (err) {
      console.warn("TikTok embed failed:", err);
    }
  }
}, [embedHtmlMap]);


  useEffect(() => {
    const stored = localStorage.getItem("comments");

    if (stored) {
      const parsed: Comment[] = JSON.parse(stored);
     const filtered = parsed.filter(c => !c.parentId && !c.pending); // ❗ фільтрація pending

const recent = filtered.sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

setComments(recent);

const dateMap: Record<string, string> = {};
for (const c of recent) {
  dateMap[c.id] = new Date(c.createdAt).toLocaleDateString();
}
setClientDates(dateMap);

const dislikeMap = new Map<string, number>();

      for (const c of filtered) {
        const ratingRaw = localStorage.getItem(`rating-${c.id}`);
        if (ratingRaw) {
          const rating = JSON.parse(ratingRaw);
          const down = rating.down || 0;
          if (down > 0) {
            const current = dislikeMap.get(c.plate) || 0;
            dislikeMap.set(c.plate, current + down);
          }
        }
      }

      const sortedWorst = Array.from(dislikeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([plate]) => plate);

      setWorstDrivers(sortedWorst);
    }
  }, []);  

useEffect(() => {
  const user = localStorage.getItem("user");
  if (!user) return;

  try {
    const parsed = JSON.parse(user);
    const type = parsed?.type || (parsed?.pro ? "pro" : "free");
    setUserType(type);
    // ➕ Додаємо значок PRO
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

function getBadgesForUser(email?: string): string[] {
  if (!email) return [];

  try {
    const raw = localStorage.getItem("users");
    if (!raw) return [];

    const users: User[] = JSON.parse(raw);
    const key = email.trim().toLowerCase();

    const match = users.find((u) => u.email?.trim().toLowerCase() === key);
    return match?.badges || [];
  } catch {
    return [];
  }
}



  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
 {userType !== "pro" && <BannerAd />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="w-full lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-6">{t.latest_comments}</h2>
          <div className="space-y-4">

            {paginatedComments.map((c) => {
              const plateImage = `/img/${c.province.toLowerCase().replace(/[^\w]/gi, "")}-plate.png`;
              return (
                <div
                  key={c.id}
                  className="bg-white border border-blue-200 rounded-xl shadow-md p-5 space-y-3 hover:shadow-2x1 transition"
                >
                  <Link href={`/plate/${encodeURIComponent(c.province.toLowerCase().replace(/[^\w]/gi, ""))}/${c.plate}`}>
                    <div className="text-sm text-gray-500 text-right mb-1 flex items-center justify-end gap-2">
  <span className="flex items-center gap-2">
    <BadgeList badges={c.badges || []} />
    <strong>{c.author || t.anonymous}</strong>
  </span>
· <strong>{c.province}</strong> · {clientDates[c.id] || ""}
</div>

<div className="relative inline-block w-[140px] h-[70px] sm:w-[180px] sm:h-[90px]">
  <Image
    src={plateImage}
    alt={`Номер ${c.plate}`}
    width={180}
    height={90}
    className="w-full h-full object-contain"
  />
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-[20px] sm:text-[26px] font-bold tracking-[0.015em] text-blue-900 drop-shadow scale-y-125">
      {c.plate}
    </span>
  </div>
</div>

<TranslatedComment text={c.comment} />

{embedHtmlMap[c.id] && (
  <div className="mt-2">{parse(embedHtmlMap[c.id]!)}</div>
)}

    {c.videoUrl && <TikTokEmbed url={c.videoUrl} />}

                  </Link>
                    {c.media?.[0]?.url && (
                      c.media[0].type.startsWith("video") ? (
                        <video
                          src={c.media[0].url}
                          controls
                          className="w-full max-w-[300px] sm:max-w-[100px] h-auto rounded mt-2 mx-auto"
                        />
                      ) : (
<div className="w-full max-w-[100px] sm:max-w-[200px] mx-auto mt-2">
  <Image
    src={c.media[0].url}
    alt="Додане зображення"
    width={300}
    height={200}
    className="rounded object-cover w-full h-auto cursor-zoom-in"
    onClick={() => setFullscreenImage(c.media[0].url)}
  />
</div>

                      )
                    )}

                  <div className="flex justify-end"><PlateRatingBlock plate={c.plate} /></div>
                </div>
              );
            })}
          </div>

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
<h2>{t.worstDriversJune}</h2>
  <h2 className="text-lg font-bold text-blue-900 mb-4">
  {t.worst_drivers_for} {currentMonth}
</h2>
  <ol className="list-decimal list-inside space-y-2 text-blue-800 font-semibold">
    {worstDrivers.map((plate, index) => {
      const comment = comments.find((c) => c.plate === plate);
      const province = comment?.province || "manitoba";
      return (
        <li key={index}>
          <Link
            href={`/plate/${encodeURIComponent(province.toLowerCase().replace(/[^\w]/gi, ""))}/${plate}`}
            className="hover:underline"
          >
            {plate}
          </Link>
        </li>
      );
    })}
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