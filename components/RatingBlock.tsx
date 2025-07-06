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
  allRatings?: Record<string, RatingData>;
};

export default function RatingBlock({ commentId, allRatings }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finalEmail, setFinalEmail] = useState("guest@myplatecheck.com");

  useEffect(() => {
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

  useEffect(() => {
  if (allRatings && allRatings[commentId]) {
    const data = allRatings[commentId];
    setUpVotes(data.up);
    setDownVotes(data.down);
    if (data.userVote === "up" || data.userVote === "down") {
      setVoted(data.userVote);
    }
  } else {
    // fallback на локальний votedComments
    const votedComments = JSON.parse(localStorage.getItem("votedComments") || "{}");
    const vote = votedComments[commentId];
    if (vote === "up" || vote === "down") {
      setVoted(vote);
    }
  }
}, [commentId, allRatings, finalEmail]);


  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/comment-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          type,
          email: finalEmail,
        }),
      });

      if (res.status === 400 || res.status === 409) {
        setShowModal(true);
        return;
      }

      if (!res.ok) throw new Error("Vote failed");

      if (type === "up") setUpVotes((prev) => prev + 1);
      else setDownVotes((prev) => prev + 1);
      setVoted(type);

      const votedComments = JSON.parse(localStorage.getItem("votedComments") || "{}");
      votedComments[commentId] = type;
      localStorage.setItem("votedComments", JSON.stringify(votedComments));
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
          className={`px-1 py-0.5 rounded ${voted === "up" ? "bg-green-200" : "bg-white"} border`}
        >
          👍 {upVotes}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`px-1 py-0.5 rounded ${voted === "down" ? "bg-red-200" : "bg-white"} border`}
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
