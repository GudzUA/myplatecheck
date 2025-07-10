"use client";

import { useEffect, useState } from "react";
import { translations } from "../translations";
import { useLanguage } from "../context/LanguageContext";

type RatingData = {
  up: number;
  down: number;
  userVote?: "up" | "down";
};

type Props = {
  replyId: string;
  allRatings: Record<string, RatingData>;
};

export default function ReplyRatingBlock({ replyId, allRatings }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const initial = allRatings[replyId] || { up: 0, down: 0 };
  const [upVotes, setUpVotes] = useState(initial.up);
  const [downVotes, setDownVotes] = useState(initial.down);
  const [voted, setVoted] = useState<"up" | "down" | null>(initial.userVote || null);
  const [showModal, setShowModal] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let email = "guest@myplatecheck.com";
    const stored = localStorage.getItem("user");

    try {
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) email = parsed.email;
      }
    } catch (e) {
      console.error("Failed to parse user", e);
    }

    if (email === "guest@myplatecheck.com") {
      let guestId = localStorage.getItem("guestId");
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
      }
      email = `guest-${guestId}@myplatecheck.com`;
    }

    setFinalEmail(email);
  }, []);

  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/reply-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId, email: finalEmail, type }),
      });

      if (res.ok) {
        setVoted(type);
        if (type === "up") setUpVotes(prev => prev + 1);
        else setDownVotes(prev => prev + 1);

        // ✅ Зберігаємо локально, щоб після reload була підсвітка
        const storedVotes = localStorage.getItem("votedReplies");
        let parsedVotes: Record<string, "up" | "down"> = {};
        try {
          parsedVotes = storedVotes ? JSON.parse(storedVotes) : {};
        } catch {}

        parsedVotes[replyId] = type;
        localStorage.setItem("votedReplies", JSON.stringify(parsedVotes));
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
    <>
      <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
        <span className="mr-2">{t.rate_reply}</span>
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
          className={`px-1 py-0.5 rounded ${
            voted === "down" ? "bg-red-200" : "bg-white"
          } border`}
        >
          👎 {downVotes}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-md text-center">
            <p className="text-xs">{t.already_voted}</p>
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

