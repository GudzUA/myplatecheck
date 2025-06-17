"use client";

import { useEffect, useState } from "react";
import { translations } from "../translations";
import { useLanguage } from "../context/LanguageContext";

export default function ReplyRatingBlock({ replyId }: { replyId: string }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [rating, setRating] = useState({ up: 0, down: 0 });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`reply-rating-${replyId}`);
    if (raw) {
      const saved = JSON.parse(raw);
      setRating(saved);
      setVoted(saved.voted);
      setDisabled(true);
    }
  }, [replyId]);

  const handleVote = (dir: "up" | "down") => {
    if (disabled) return;
    const updated = {
      ...rating,
      [dir]: (rating[dir] || 0) + 1,
      voted: dir,
    };
    setRating(updated);
    setVoted(dir);
    setDisabled(true);
    localStorage.setItem(`reply-rating-${replyId}`, JSON.stringify(updated));
  };

  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
      <span className="mr-2">{t.rate_reply}</span>
      <button
        onClick={() => handleVote("up")}
        disabled={disabled}
        className={`px-2 py-1 rounded border ${
          voted === "up" ? "bg-green-200" : "bg-white"
        }`}
      >
        👍 {rating.up}
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={disabled}
        className={`px-2 py-1 rounded border ${
          voted === "down" ? "bg-red-200" : "bg-white"
        }`}
      >
        👎 {rating.down}
      </button>
    </div>
  );
}
