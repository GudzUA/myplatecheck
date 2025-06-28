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
};

export default function HomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [worstDrivers, setWorstDrivers] = useState<{ plate: string; dislikes: number }[]>([]);
  const [userType, setUserType] = useState<"guest" | "free" | "pro">("guest");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [clientDates, setClientDates] = useState<Record<string, string>>({});
  const [embedHtmlMap, setEmbedHtmlMap] = useState<Record<string, string | null>>({});
  const [ratings, setRatings] = useState<Record<string, { up: number; down: number }>>({});

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

function getEmbedHTML(url: string): string | null {
  if (!url) return null;

  // TikTok
  if (url.includes("tiktok.com")) {
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match?.[1];
    if (!videoId) return null;

    return `
      <blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px;">
        <section></section>
      </blockquote>
    `;
  }

  // YouTube
  if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  // Facebook
  if (url.includes("facebook.com") && url.includes("video")) {
    const encodedUrl = encodeURIComponent(url);
    return `
      <iframe src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500"
        width="100%" height="280" style="border:none;overflow:hidden" scrolling="no" frameborder="0"
        allowfullscreen="true"></iframe>
    `;
  }

 // ✅ Instagram
if (url.includes("instagram.com/p/")) {
  return `
    <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="width:100%; max-width:540px;">
    </blockquote>
  `;
}

  return null;
}



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
const worst: { plate: string; dislikes: number }[] = await resWorst.json();
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
  const commentIds = comments.map((c) => c.id); // ✅ ТУТ ФОРМУЄМО
  if (commentIds.length === 0) return;

  try {
    const user = localStorage.getItem("user");
const email = user ? JSON.parse(user).email : "guest";

const res = await fetch("/api/rating/batch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ commentIds, email }), // ✅ тепер і commentIds, і email
});
    const data = await res.json();
    setRatings(data); // ✅ не забудь зберегти
  } catch (err) {
    console.error("Rating fetch error", err);
  }
}


  fetchRatings();
}, [comments]); // 🔁 не забути додати comments у залежності


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
</Link>

{/* Виносимо переклад + embed ПОЗА Link */}
<TranslatedComment id={c.id} text={c.comment} />

{embedHtmlMap[c.id] && (
  <div className="mt-2">
    {parse(embedHtmlMap[c.id]!)}
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
          width={120}
          height={120}
          className="cursor-pointer rounded hover:shadow-lg hover:scale-105 transition object-contain"
          onClick={() => setFullscreenImage(m.url)}
        />
      ) : m.type.startsWith("video") ? (
        <video
          key={idx}
          src={m.url}
          controls
          className="w-full max-w-[200px] h-auto rounded mt-2"
        />
      ) : null
    )}
  </div>
)}


                  <div className="flex justify-end"><RatingBlock commentId={c.id}email={c.email}initialVotes={ratings[c.id]}/></div>
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
  <h2 className="text-lg font-bold text-blue-900 mb-4">
  {t.worst_drivers_for} {currentMonth}
</h2>
<ol className="list-decimal list-inside space-y-2 text-blue-800 font-semibold">
  {worstDrivers.map((item, index) => (
    <li key={index}>
      <Link
  href={`/plate/${encodeURIComponent(item.plate)}`}
  className="hover:underline"
>
  {item.plate}
</Link>{" "}
      — 👎 {item.dislikes}
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