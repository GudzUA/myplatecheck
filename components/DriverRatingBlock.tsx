"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

export default function DriverRatingBlock({ plate }: { plate: string }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [rating, setRating] = useState({ up: 0, down: 0 });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`driver-rating-${plate}`);
    if (raw) {
      const saved = JSON.parse(raw);
      setRating(saved);
      setVoted(saved.voted);
      setDisabled(true);
    }
  }, [plate]);

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
    localStorage.setItem(`driver-rating-${plate}`, JSON.stringify(updated));
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-800 mt-2">
      <span className="font-semibold text-base mr-2">{t.rate_driver}</span>
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
