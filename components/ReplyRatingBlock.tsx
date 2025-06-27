"use client";

import { useEffect, useState } from "react";
import { translations } from "../translations";
import { useLanguage } from "../context/LanguageContext";


export default function ReplyRatingBlock({ replyId }: { replyId: string }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);

  const email =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")?.email || "guest"
      : "guest";

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/reply-rating?replyId=${replyId}`);
        if (!res.ok) return;
        const data = await res.json();
        setUpVotes(data.up);
        setDownVotes(data.down);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchRating();
  }, [replyId]);

  const handleVote = async (type: "up" | "down") => {
    try {
      const res = await fetch("/api/reply-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId, email, type }),
      });

      if (res.ok) {
        if (type === "up") setUpVotes((prev) => prev + 1);
        else setDownVotes((prev) => prev + 1);
        setVoted(type);
      } else if (res.status === 409) {
        setShowModal(true);
      } else {
        const errText = await res.text();
        console.error("Vote error", res.status, errText);
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
      <span className="mr-2">{t.rate_reply}</span>
      <button
        onClick={() => handleVote("up")}
        className={`px-2 py-1 rounded border ${
          voted === "up" ? "bg-green-200" : "bg-white"
        }`}
      >
        👍 {upVotes}
      </button>
      <button
        onClick={() => handleVote("down")}
        className={`px-2 py-1 rounded border ${
          voted === "down" ? "bg-red-200" : "bg-white"
        }`}
      >
        👎 {downVotes}
      </button>

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

    
    </div>
  );
}
