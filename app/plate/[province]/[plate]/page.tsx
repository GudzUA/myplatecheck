"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RatingBlock from "../../../../components/RatingBlock";
import ReplyRatingBlock from "../../../../components/ReplyRatingBlock";
import DriverRatingBlock from "../../../../components/DriverRatingBlock";
import ModalAlert from "../../../../components/ModalAlert";
import LoginRegisterModal from "../../../../components/LoginRegisterModal";
import { getEmbedHTML } from "../../../../utils/embed";
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
  async function fetchVotes() {
    const commentIds = comments.map((c) => c.id);
    if (commentIds.length === 0) return;

    const user = localStorage.getItem("user");
    const email = user ? JSON.parse(user).email : "guest";

    try {
      const res = await fetch("/api/rating/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentIds, email }),
      });
      const data = await res.json();
      setVotesMap(data);
    } catch (err) {
      console.error("❌ Помилка при отриманні голосів:", err);
    }
  }

  fetchVotes();
}, [comments]);


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
            const rawText = [c.comment, c.videoUrl].filter(Boolean).join(" ");
            const urls = [...rawText.matchAll(/https?:\/\/\S+/g)];
            const embeds = urls.map(match => getEmbedHTML(match[0])).filter(Boolean)

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
  {embeds.length > 0 && (
  <div className="mt-2 space-y-2">
    {embeds.map((html, i) => (
     <div key={i}>{parse(html || "")}</div>
    ))}
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
  <RatingBlock commentId={c.id} />
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

