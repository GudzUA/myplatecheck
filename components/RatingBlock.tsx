"use client";

import { useEffect, useState } from "react";
import { translations } from "../translations";
import { useLanguage } from "../context/LanguageContext";

 export default function RatingBlock({ commentId }: { commentId: string }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [rating, setRating] = useState({ up: 0, down: 0 });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`rating-${commentId}`);
    if (raw) {
      const saved = JSON.parse(raw);
      setRating(saved);
      setVoted(saved.voted);
      setDisabled(true);
    }
  }, [commentId]);

  const handleVote = (direction: "up" | "down") => {
    if (disabled) return;

    const newRating = {
      ...rating,
      [direction]: (rating[direction] || 0) + 1,
      voted: direction,
    };

    setRating(newRating);
    setVoted(direction);
    setDisabled(true);
    localStorage.setItem(`rating-${commentId}`, JSON.stringify(newRating));
  };

  return (
    <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
      <span className="mr-2">{t.rate_comment}</span>
      <button
        onClick={() => handleVote("up")}
        disabled={disabled}
        className={`px-2 py-1 rounded ${
          voted === "up" ? "bg-green-200" : "bg-white"
        } border`}
      >
        👍 {rating.up}
      </button>
      <button
        onClick={() => handleVote("down")}
        disabled={disabled}
        className={`px-2 py-1 rounded ${
          voted === "down" ? "bg-red-200" : "bg-white"
        } border`}
      >
        👎 {rating.down}
      </button>
    </div>
  );
}
