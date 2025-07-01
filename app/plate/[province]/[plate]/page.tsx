"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RatingBlock from "../../../../components/RatingBlock";
import ReplyRatingBlock from "../../../../components/ReplyRatingBlock";
import DriverRatingBlock from "../../../../components/DriverRatingBlock";
import ModalAlert from "../../../../components/ModalAlert";
import LoginRegisterModal from "../../../../components/LoginRegisterModal";
import parse from "html-react-parser";
import { useLanguage } from "../../../../context/LanguageContext";
import { translations } from "../../../../translations";
import Image from "next/image";
import TranslatedComment from "../../../../components/TranslatedComment";
import BadgeList from "../../../../components/BadgeList";

type User = {
  email?: string;
  badges?: string[];
};
type RatingData = {
  up: number;
  down: number;
  userVote?: "up" | "down";
};


type MediaItem = { url: string; type: string };
type Comment = {
  id: string;
  plate: string;
  province: string;
  author: string;
  comment: string;
  createdAt: string;
  parentId?: string;
  media?: MediaItem[];
  videoUrl?: string;
  votes?: number;
  email?: string;        
  pending?: boolean;      
  userType?: string;
  badges?: string[];     
};

export default function PlatePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const rawParams = useParams();
  const plateCode = ((rawParams.plate || "") as string).toUpperCase();
  const provinceCode = decodeURIComponent((rawParams.province || "") as string);
  const plateImage = `/img/${provinceCode.toLowerCase().replace(/[^\w]/g, "")}-plate.png`;

  const [comments, setComments] = useState<Comment[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, Comment[]>>({});
  const [showReplyId, setShowReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [alertMode, setAlertMode] = useState<"login" | "upgrade" | undefined>(undefined);
  const [showLogin, setShowLogin] = useState(false);
  const [replyDates, setReplyDates] = useState<Record<string, string>>({});
  const [embedHtmlMap, setEmbedHtmlMap] = useState<{ [id: string]: string }>({});
  const [ratingsMap, setRatingsMap] = useState<Record<string, RatingData>>({});


useEffect(() => {
  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?plate=${plateCode}&province=${provinceCode}&includeReplies=true`);
      const all: Comment[] = await res.json();

      const relevant = all.filter(
        c =>
          c.plate.toLowerCase() === plateCode.toLowerCase() &&
          c.province.toLowerCase() === provinceCode.toLowerCase() &&
          !c.pending
      );

      const root = relevant.filter(c => !c.parentId);

      const replies: Record<string, Comment[]> = {};
      relevant.forEach(c => {
        if (c.parentId) {
          if (!replies[c.parentId]) replies[c.parentId] = [];
          replies[c.parentId].push(c);
        }
      });

      setComments(root);
      setReplyMap(replies);

      const dates: Record<string, string> = {};
      for (const c of relevant) {
        dates[c.id] = new Date(c.createdAt).toLocaleString();
      }
      setReplyDates(dates);

      // 👉 ОНОВЛЕНИЙ embedMap без зайвої змінної
      const embedMap: Record<string, string | null> = {};

      for (const c of relevant) {
        const rawText = [c.comment, c.videoUrl].filter(Boolean).join(" ");
        const urls = [...rawText.matchAll(/https?:\/\/\S+/g)];

        embedMap[c.id] = urls
          .map(match => getEmbedHTML(match[0]))
          .filter(Boolean)
          .join("<br/>") || null;
      }

      const cleanedMap: { [id: string]: string } = {};
      for (const key in embedMap) {
        if (embedMap[key]) {
          cleanedMap[key] = embedMap[key]!;
        }
      }

      setEmbedHtmlMap(cleanedMap);
    } catch (err) {
      console.error("❌ ПОМИЛКА:", err);
    }
  }

  loadComments();
}, [plateCode, provinceCode]);

useEffect(() => {
  if (comments.length === 0) return;

  const ids = comments.map(c => c.id).join(",");
  const stored = localStorage.getItem("user");
  const email = stored ? JSON.parse(stored)?.email || "guest" : "guest";

  fetch(`/api/rating/batch?ids=${ids}&email=${email}`)
    .then(res => res.json())
    .then((data: Record<string, RatingData>) => {
      setRatingsMap(data);
    })
    .catch(err => console.error("❌ Rating batch error:", err));
}, [comments]);


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

  // Instagram
  if (url.includes("instagram.com/p/")) {
    return `
      <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="width:100%; max-width:540px;">
      </blockquote>
    `;
  }

  return null;
}


const handleReplySubmit = async (parentId: string) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    setModalMessage(t.login_required_to_reply);
    setAlertMode("login");
    return;
  }

  const newReply = {
  plate: plateCode.toUpperCase(),
  province: provinceCode.toUpperCase(),
  author: user?.login || user?.email || "Гість",
  comment: replyText,
  createdAt: new Date().toISOString(),
  parentId,
  email: user?.email || null,
  pending: false,
  userId: user.id

};

  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReply),
    });

    if (!res.ok) throw new Error("Не вдалося зберегти відповідь");

    const saved: Comment = await res.json();

    setComments(prev => [...prev, saved]);
    setReplyMap(prev => ({
      ...prev,
      [parentId]: [...(prev[parentId] || []), saved],
    }));
    setReplyText("");
    setShowReplyId(null);

    const map = { ...replyDates };
    map[saved.id] = new Date(saved.createdAt).toLocaleString();
    setReplyDates(map);
  } catch (error) {
    alert("❌ Помилка при збереженні відповіді.");
    console.error(error);
  }
};

  const rootComments = comments.filter(c => !c.parentId);

function getBadgesForUser(email?: string): string[] {
  if (!email) return [];

  try {
    const raw = localStorage.getItem("users");
    if (!raw) return [];

    const users = JSON.parse(raw);
    const key = email.trim().toLowerCase();

    const match = users.find((u: User) => u.email?.trim().toLowerCase() === key);
    return match?.badges || [];
  } catch {
    return [];
  }
}

interface TikTokWindow extends Window {
  tiktokEmbedLoad?: () => void;
}

useEffect(() => {
  const existingScript = document.querySelector("script[src='https://www.tiktok.com/embed.js']");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  } else {
    setTimeout(() => {
      const win = window as TikTokWindow;
      if (win.tiktokEmbedLoad) {
        win.tiktokEmbedLoad();
      }
    }, 100);
  }
}, [comments]);

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


  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-start gap-6 mb-6">
        <div className="relative inline-block w-[180px] h-[90px]">
          <Image
  src={plateImage}
  alt={`${provinceCode} plate`}
  width={180}
  height={90}
  className="w-full h-full object-contain"
/>
          <span className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[28px] font-bold tracking-[0.015em] text-blue-900 drop-shadow scale-y-125">{plateCode}</span>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-xl font-semibold text-gray-800 mb-2">CAR</div>
          <div>
            <span className="text-xl font-bold text-gray-800 mb-2 block">{t.rate_driver}</span>
            <DriverRatingBlock
  plate={plateCode}
  email={typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.email : undefined}
  province={provinceCode}
/>
          </div>
        </div>          
      </div>

      {rootComments.length === 0 ? (
        <p className="text-gray-500 italic">{t.no_comments_for_plate}</p>
      ) : (
        <ul className="space-y-6">
          {rootComments.map((c) => {

            return (
              <li key={c.id} className="mb-8">
                <div className="bg-white p-4 rounded-xl shadow-md border border-blue-200 space-y-2">
<div className="text-sm text-gray-600 text-right font-medium flex justify-end items-center gap-1">
  <span className="flex items-center gap-2">
    <BadgeList badges={c.badges || []} />
    <strong>{c.author || t.anonymous}</strong> · <strong>{c.province}</strong> · {replyDates[c.id] || ""}
  </span>
</div>
<TranslatedComment id={c.id} text={c.comment} />

  {embedHtmlMap[c.id] && (
  <div className="mt-2 w-full max-w-full overflow-hidden">
    <div className="max-w-[100%] sm:max-w-[540px] mx-auto">
      {parse(embedHtmlMap[c.id])}
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
          width={200}
          height={150}
          className="cursor-pointer rounded hover:shadow-lg hover:scale-105 transition object-contain"
        />
      ) : m.type.startsWith("video") ? (
        <video
          key={idx}
          src={m.url}
          controls
          className="w-full max-w-[300px] h-auto rounded mt-2"
        />
      ) : null
    )}
  </div>
)}

  <div className="mt-2 flex justify-end items-center gap-3">
  <RatingBlock commentId={c.id} email={c.email} allRatings={ratingsMap} />
  </div>
</div>

                {replyMap[c.id]?.length > 0 && (
               <div className="mt-3 space-y-3">
             {replyMap[c.id].map((reply) => (
                   <div
                 key={reply.id}
        className="ml-auto mr-2 w-[92%] bg-white border border-blue-100 p-4 rounded-lg shadow-sm"
      >
       <div className="text-sm text-gray-600 text-right font-medium flex justify-end items-center gap-1">
  <BadgeList badges={getBadgesForUser(reply.email)} />
  <strong>{reply.author || t.anonymous}</strong> · <strong>{reply.province}</strong> · {replyDates[reply.id] || ""}
</div>
       <TranslatedComment id={reply.id} text={reply.comment} />
        <div className="mt-2 flex justify-end">
         <ReplyRatingBlock replyId={reply.id} />
        </div>
      </div>
    ))}
  </div>
)}


{showReplyId === c.id && (
  <div className="ml-auto mr-2 w-[92%] bg-gray-50 border border-blue-100 p-4 rounded-lg shadow-sm mt-3">
    <p className="text-sm font-semibold text-gray-800 mb-2">{t.your_reply}</p>
    <textarea
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      placeholder={t.placeholder_reply}
    />
    <div className="flex gap-2 mt-3 justify-end">
      <button
        onClick={() => handleReplySubmit(c.id)}
        className="bg-blue-800 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-900 transition"
      >
        {t.send}
      </button>
      <button
        onClick={() => setShowReplyId(null)}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        {t.cancel}
      </button>
    </div>
  </div>
)}


                {showReplyId !== c.id && (
                  <div className="mt-2 flex justify-end">
                    <button
  onClick={() => setShowReplyId(c.id)}
  className="bg-blue-800 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-900 transition"
>
  {t.reply_action}
</button>

                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {modalMessage && (
        <ModalAlert
          show={true}
          title={t.attention}
          message={modalMessage}
          mode={alertMode}
          onLogin={() => {
            setModalMessage(null);
            setShowLogin(true);
          }}
          onUpgrade={() => {
            setModalMessage(null);
            router.push("/upgrade");
          }}
          onClose={() => {
            setModalMessage(null);
            setAlertMode(undefined);
          }}
        />
      )}

      {showLogin && <LoginRegisterModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}

