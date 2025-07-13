"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import TranslatedComment from "../../../components/TranslatedComment";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { TranslationsProvider } from "@/context/TranslationsContext";

// Типізація
interface Comment {
  id: string;
  comment: string;
  plate: string;
  province: string;
  createdAt: string;
  author: string;
  pending?: boolean;
  email?: string;
  videoUrl?: string;
  badges?: string[];
  language: string;
  media?: {
    name: string;
    type: string;
    url: string;
  }[];
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function ModerationPage() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReasonSelector, setShowReasonSelector] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const tiktokRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [translationsMap, setTranslationsMap] = useState<Record<string, Record<string, string>>>({});
  const fetchedLangsRef = useRef<Set<string>>(new Set());

const { lang } = useLanguage();
const t = translations[lang];

useEffect(() => {
  if (!pendingComments.length) return;

  const untranslated = pendingComments.filter(
    (c) => c.language !== lang && !translationsMap[lang]?.[c.id]
  );

  if (!untranslated.length) return;

  // Не робимо дубльовані запити
  if (fetchedLangsRef.current.has(lang)) return;

  const ids = untranslated.map(c => c.id);

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

      setTranslationsMap(prev => ({
        ...prev,
        [lang]: {
          ...(prev[lang] || {}),
          ...batchMap,
        },
      }));

      fetchedLangsRef.current.add(lang);

      const missing = untranslated.filter(c => !batchMap[c.id]);
      if (!missing.length) return;

      const items = missing.map(c => ({
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
        setTranslationsMap(prev => ({
          ...prev,
          [lang]: {
            ...(prev[lang] || {}),
            ...liveMap,
          },
        }));
      }
    })
    .catch((err) => console.error("❌ Translation fetch error:", err));
}, [pendingComments, lang]);



  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch("/api/comments/pending");
        const data: Comment[] = await res.json();
        if (!Array.isArray(data)) {
          console.error("❌ API /comments не повернув масив:", data);
          return;
        }
        const filtered = data.filter((c) => c.pending);
        setPendingComments(filtered);
        fetchedLangsRef.current = new Set();

const items = filtered
  .filter((c) => c.language && c.language !== lang)
  .map((c) => ({ id: c.id, text: c.comment }));

if (items.length > 0) {
  const batchRes = await fetch("/api/translate/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: items.map(i => i.id), lang }),
  });
  const batchData = await batchRes.json();
  const batchMap: Record<string, string> = {};
  for (const item of batchData.translations || []) {
    if (item.language === lang) {
      batchMap[item.commentId] = item.text;
    }
  }
  setTranslationsMap(prev => ({
    ...prev,
    [lang]: batchMap,
  }));
}

      } catch (err) {
        console.error("❌ Помилка при завантаженні коментарів:", err);
      }
    }
    fetchComments();
  }, []);

  useEffect(() => {
  const existingScript = document.querySelector("script[src='https://www.tiktok.com/embed.js']");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    script.onload = () => {
      try {
        const w = window as Window & { tiktokEmbedLoad?: () => void };
        if (typeof w.tiktokEmbedLoad === "function") {
          w.tiktokEmbedLoad();
        }
      } catch (err) {
        console.warn("TikTok embed load error", err);
      }
    };
    document.body.appendChild(script);
  } else {
    setTimeout(() => {
      const w = window as Window & { tiktokEmbedLoad?: () => void };
      if (typeof w.tiktokEmbedLoad === "function") {
        w.tiktokEmbedLoad();
      }
    }, 100);
  }
}, [pendingComments, lang]);


  const allowComment = async (id: string) => {
  await fetch("/api/moderation/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  const approvedComment = pendingComments.find((c) => c.id === id);


  // 🔔 Надсилаємо email тільки якщо він є
  if (approvedComment?.email && approvedComment.email !== "guest@myplatecheck.com") {
  await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: approvedComment.email,
      subject: "comment_approved",
      message: approvedComment.plate,
      lang: approvedComment.language,
    }),
  });
}
  setPendingComments((prev) => prev.filter((c) => c.id !== id));
};
 const deleteComment = async (id: string, reason: string) => {
  const deletedComment = pendingComments.find((c) => c.id === id);

  await fetch("/api/moderation/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  // 🔔 Email при відхиленні
  if (deletedComment?.email && deletedComment.email !== "guest@myplatecheck.com") {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: deletedComment.email,
        subject: "comment_rejected",
        message: `REJECTED:${deletedComment.plate}:${reason}`,
        lang: deletedComment.language,
      }),
    });
  }

  setPendingComments((prev) => prev.filter((c) => c.id !== id));
};



  return (
   <TranslationsProvider translations={translationsMap[lang] || {}}>
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.moderation_title}</h1>
      {pendingComments.length === 0 ? (
        <p className="text-gray-500">{t.no_pending_comments}</p>
      ) : (
        <ul className="space-y-4">
          {pendingComments.map((c) => (
            <li key={c.id} className="bg-white p-4 border border-blue-200 rounded shadow-sm">
              <div className="text-sm text-gray-500 mb-1">
                <strong>{c.plate}</strong> • {c.province} • {new Date(c.createdAt).toLocaleString()}
              </div>

              {Array.isArray(c.media) && c.media.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {c.media.map((m, idx) => (
                    m?.type?.startsWith("image") && m.url ? (
                      <div key={idx} className="relative">
                        <Image
                          src={m.url}
                          alt={`media-${idx}`}
                          width={100}
                          height={100}
                          className="cursor-pointer rounded hover:shadow-lg hover:scale-105 transition object-contain"
                          onClick={() => setFullscreenImage(m.url)}
                        />
          {true && ( // ← ПОТІМ ЗАМІНИ НА user?.email === "admin@example.com"
            <button
  onClick={async () => {
    const confirmed = confirm("Видалити це зображення?");
    if (!confirmed) return;

    try {
console.log("➡️ Видалення:", {
  commentId: c.id,
  mediaUrl: m.url,
});

      const res = await fetch("/api/moderation/delete-media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: c.id,
          mediaUrl: m.url,
        }),
      });

      if (res.ok) {
        setPendingComments((prev) =>
          prev.map((comment) =>
            comment.id === c.id
              ? {
                  ...comment,
                  media: comment.media?.filter((mediaItem) => mediaItem.url !== m.url),
                }
              : comment
          )
        );
      } else {
  const error = await res.json();
  console.error("❌ Не вдалось видалити:", error);
}

    } catch (err) {
      console.error("❌ Запит помилка:", err);
    }
  }}
  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow"
>
  🗑
</button>

          )}

                      </div>
                    ) : null
                  ))}
                </div>
              )}

              {c.videoUrl?.includes("tiktok.com") ? (
                <div
                  className="mt-3"
                  ref={(el) => {
                    if (el && !tiktokRefs.current[c.id]) {
                      tiktokRefs.current[c.id] = el;
                      const blockquote = document.createElement("blockquote");
                      blockquote.className = "tiktok-embed";
                     blockquote.setAttribute("cite", c.videoUrl || "");
                      blockquote.style.maxWidth = "605px";
                      blockquote.style.minWidth = "325px";
                      const section = document.createElement("section");
                      blockquote.appendChild(section);
                      el.innerHTML = "";
                      el.appendChild(blockquote);
                      interface TikTokWindow extends Window {
  tiktokEmbedLoad?: () => void;
}
const win = window as TikTokWindow;

setTimeout(() => {
  if (typeof win.tiktokEmbedLoad === "function") {
    win.tiktokEmbedLoad();
  }
}, 300);                                
                    }
                  }}
                />
              ) : c.videoUrl?.includes("youtube.com") || c.videoUrl?.includes("youtu.be") ? (
                <div className="mt-3">
                  <iframe
                    src={getYouTubeEmbedUrl(c.videoUrl)!}
                    width="100%"
                    height="250"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="rounded border"
                  ></iframe>
                </div>
              ) : null}

              <TranslatedComment id={c.id} originalText={c.comment} />
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => allowComment(c.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  {t.allow_button}
                </button>

                {selectedId === c.id && showReasonSelector ? (
                  <div className="flex flex-col gap-2 items-end w-full">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    >
                  <option value="">{t.select_reason}</option>
                  <option value="image_violation">{t.reason_image_violation}</option>
                  <option value="inappropriate_text">{t.reason_inappropriate_text}</option>
                  <option value="spam">{t.reason_spam}</option>
                </select>
                    <div className="flex gap-2 justify-end">
            <button
  onClick={() => {
    if (!cancelReason) return alert(t.select_reason);
    if (!selectedId) return;
    deleteComment(selectedId, cancelReason);
    setSelectedId(null);
    setShowReasonSelector(false);
    setCancelReason("");
  }}
  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
>
  {t.confirm_delete_button}
</button>

                      <button
                        onClick={() => {
                          setSelectedId(null);
                          setShowReasonSelector(false);
                          setCancelReason("");
                        }}
                        className="text-sm text-gray-500 underline"
                      >
                        {t.cancel_delete_button}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedId(c.id);
                      setShowReasonSelector(true);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    {t.delete_button}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
          <Image
            src={fullscreenImage}
            alt="fullscreen"
            width={800}
            height={600}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border-2 border-white object-contain"
          />
        </div>
      )}
    </main>
   </TranslationsProvider>
  );
}
