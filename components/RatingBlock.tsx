"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

type RatingData = {
  up: number;
  down: number;
  userVote?: "up" | "down";
};

type Props = {
  commentId: string;
  email?: string;
  initialVotes?: { up: number; down: number };
  allRatings?: Record<string, RatingData>; // ⬅️ Додано сюди
};

export default function RatingBlock({ commentId, email, allRatings }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
  if (allRatings && allRatings[commentId]) {
    const data = allRatings[commentId];
    setUpVotes(data.up);
    setDownVotes(data.down);
    setVoted(data.userVote || null);
  }
}, [commentId, allRatings]); 


  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          email: email || "guest",
          type,
        }),
      });

      if (!res.ok) throw new Error(`Vote failed: ${res.statusText}`);

      if (type === "up") setUpVotes((prev) => prev + 1);
      else setDownVotes((prev) => prev + 1);
      setVoted(type);
    } catch (err) {
      console.error("❌ Vote error:", err);
    }
  };

  return (
    <>
      <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
        <span className="mr-2">{t.rate_comment}</span>
        <button
          onClick={() => handleVote("up")}
          className={`px-1 py-0.5 rounded ${
            voted === "up" ? "bg-green-200" : "bg-white"
          } border`}
        >
          👍 {upVotes}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`px-1.5 py-0.5 rounded ${
            voted === "down" ? "bg-red-200" : "bg-white"
          } border`}
        >
          👎 {downVotes}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <p className="text-sm">{t.already_voted}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-3 px-4 py-1 bg-blue-600 text-white rounded text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
