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
};

export default function PlatePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [votesMap, setVotesMap] = useState<Record<string, { up: number; down: number }>>({});
  const rawParams = useParams();
  const plateCode = ((rawParams.plate || "") as string).toUpperCase();
  const provinceCode = decodeURIComponent((rawParams.province || "") as string);
  const plateImage = `/img/${provinceCode.toLowerCase().replace(/[^\w]/g, "")}-plate.png`;

  const [comments, setComments] = useState<Comment[]>([]);
  const [replyMap, setReplyMap] = useState<Record<string, Comment[]>>({});
  const [showReplyId, setShowReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [alertMode, setAlertMode] = useState<"login" | "upgrade" | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [newId, setNewId] = useState<string>("");
  const [replyDates, setReplyDates] = useState<Record<string, string>>({});

  useEffect(() => {
  setNewId(Date.now().toString());
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("comments");
    const votes = localStorage.getItem("votesMap");

   if (stored) {
  const all: Comment[] = JSON.parse(stored);
  const filtered = all.filter(
    c => c.plate === plateCode && c.province === provinceCode && !c.pending
  );
  setComments(filtered);

      const replies: Record<string, Comment[]> = {};
      filtered.forEach(c => {
        if (c.parentId) {
          if (!replies[c.parentId]) replies[c.parentId] = [];
          replies[c.parentId].push(c);
        }
      });
      setReplyMap(replies);
     
        const map: Record<string, string> = {};
    for (const c of filtered) {
      if (c.parentId) {
        map[c.id] = new Date(c.createdAt).toLocaleString();
      }
    }
    setReplyDates(map);
  }

  try {
  if (votes) {
    setVotesMap(JSON.parse(votes));
  }
} catch (err) {
  console.error("Не вдалося розпарсити голоси:", err);
  }
}, [plateCode, provinceCode]);

  const handleReplySubmit = (parentId: string) => {
  const replyLimitKey = `replyCount_${plateCode}_${provinceCode}`;
  const repliesUsed = parseInt(localStorage.getItem(replyLimitKey) || "0");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    if (repliesUsed >= 1) {
      setModalMessage(t.login_required_to_reply);
      setAlertMode("login");
      return;
    }
  }

  const isPro = user?.pro === true;
  const isRegistered = !!user?.login && !isPro;
  const userType = isPro ? "pro" : isRegistered ? "registered" : "guest";

  if (user && userType === "registered" && repliesUsed >= 10) {
    setModalMessage(t.reply_limit_pro);
    setAlertMode("upgrade");
    return;
  }

  const newReply: Comment = {
    id: Date.now().toString(),
    plate: plateCode,
    province: provinceCode,
    author: user?.login || user?.email || "Гість",
    comment: replyText,
    createdAt: new Date().toISOString(),
    parentId,
    userType, // 💡 тепер це визначено і буде працювати
  };

  const allComments: Comment[] = JSON.parse(localStorage.getItem("comments") || "[]");
  const updated = [...allComments, newReply];
  localStorage.setItem("comments", JSON.stringify(updated));

  if (!user || userType !== "pro") {
    localStorage.setItem(replyLimitKey, String(repliesUsed + 1));
  }

  const filtered = updated.filter(c => c.plate === plateCode && c.province === provinceCode);
  setComments(filtered);
  setReplyMap(prev => ({
    ...prev,
    [parentId]: [...(prev[parentId] || []), newReply],
  }));

  setReplyText("");
  setShowReplyId(null);
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
            <DriverRatingBlock plate={plateCode} />
          </div>
        </div>          
      </div>

      {rootComments.length === 0 ? (
        <p className="text-gray-500 italic">{t.no_comments_for_plate}</p>
      ) : (
        <ul className="space-y-6">
          {rootComments.map((c) => {
            const urlMatch = c.videoUrl || c.comment?.match(/https?:\/\/[^\s]+/)?.[0];
            const embed = urlMatch ? getEmbedHTML(urlMatch) : null;
            return (
              <li key={c.id} className="mb-8">
                <div className="bg-white p-4 rounded-xl shadow-md border border-blue-200 space-y-2">
<div className="text-sm text-gray-600 text-right font-medium flex justify-end items-center gap-1">
  <BadgeList badges={getBadgesForUser(c.email)} />
  <strong>{c.author || t.anonymous}</strong> · <strong>{c.province}</strong> · {newId}
</div>
<TranslatedComment text={c.comment} />
  {embed && <div className="mt-2">{parse(embed)}</div>}
{c.media?.[0]?.type?.startsWith("image") && (
  <div className="mt-2">
    <Image
      src={c.media[0].url}
      alt="Attached"
      width={150}
      height={100}
      className="rounded object-cover max-w-full h-auto"
    />
  </div>
)}
  <div className="mt-2 flex justify-end items-center gap-3">
  <RatingBlock commentId={c.id} />
  {votesMap[c.id] && (
    <div className="text-sm text-gray-500">
      👍 {votesMap[c.id].up || 0} | 👎 {votesMap[c.id].down || 0}
    </div>
  )}
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
       <TranslatedComment text={reply.comment} />
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
            setAlertMode(null);
          }}
        />
      )}

      {showLogin && <LoginRegisterModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}

