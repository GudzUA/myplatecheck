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
  allRatings: Record<string, RatingData>;
};

export default function RatingBlock({ commentId, allRatings }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");

  const rating = allRatings[commentId] || { up: 0, down: 0 };

  useEffect(() => {
    if (rating.userVote) {
      setVoted(rating.userVote);
    }
  }, [rating.userVote]);

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

    const storedVotes = localStorage.getItem("votedComments");
    if (storedVotes) {
      try {
        const parsedVotes = JSON.parse(storedVotes);
        if (parsedVotes[commentId]) {
          setVoted(parsedVotes[commentId]);
        }
      } catch (err) {
        console.error("Failed to parse votedComments", err);
      }
    }
  }, [commentId]);

  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/comment-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, email: finalEmail, type }),
      });

      if (res.ok) {
        setVoted(type);

        if (type === "up") {
          rating.up += 1;
        } else {
          rating.down += 1;
        }

        const storedVotes = localStorage.getItem("votedComments");
        let parsedVotes: Record<string, "up" | "down"> = {};
        try {
          parsedVotes = storedVotes ? JSON.parse(storedVotes) : {};
        } catch {}

        parsedVotes[commentId] = type;
        localStorage.setItem("votedComments", JSON.stringify(parsedVotes));
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
        <span className="mr-2">{t.rate_comment}</span>
        <button
          onClick={() => handleVote("up")}
          className={`px-1 py-0.5 rounded ${voted === "up" ? "bg-green-200" : "bg-white"} border`}
        >
          👍 {rating.up}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`px-1 py-0.5 rounded ${voted === "down" ? "bg-red-200" : "bg-white"} border`}
        >
          👎 {rating.down}
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
