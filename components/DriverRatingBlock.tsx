"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type Props = {
  plate: string;
  province: string;
  email?: string;
};

export default function DriverRatingBlock({ plate, province, email: propEmail }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finalEmail, setFinalEmail] = useState("");

  // ✅ Один єдиний useEffect
  useEffect(() => {
    let email = propEmail;

    if (!email) {
      const stored = localStorage.getItem("user");
      try {
        const parsed = stored ? JSON.parse(stored) : null;
        email = parsed?.email || "";
      } catch (e) {
        console.error("Failed to parse user", e);
      }

      if (!email || email === "guest@myplatecheck.com") {
        let guestId = localStorage.getItem("guestId");
        if (!guestId) {
          guestId = crypto.randomUUID();
          localStorage.setItem("guestId", guestId);
        }
        email = `guest-${guestId}@myplatecheck.com`;
      }
    }

    setFinalEmail(email);
  }, [propEmail]);

  // ✅ Завантаження рейтингу
  useEffect(() => {
    if (!finalEmail) return;

    const fetchRating = async () => {
      try {
        const res = await fetch(
          `/api/driver-rating?plate=${plate}&province=${province}&email=${finalEmail}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setUpVotes(data.up || 0);
        setDownVotes(data.down || 0);
        if (data.userVote) setVoted(data.userVote);
      } catch (err) {
        console.error("Load driver rating error:", err);
      }
    };

    fetchRating();
  }, [plate, province, finalEmail]);

  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/driver-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate, province, email: finalEmail, type }),
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
    <>
      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-800 mt-1 sm:mt-2">
        <span className="font-semibold text-sm sm:text-base mr-1 sm:mr-2">{t.rate_driver}</span>
        <button
          onClick={() => handleVote("up")}
          className={`px-1 py-[2px] sm:px-1.5 sm:py-1 rounded border text-xs sm:text-sm ${
            voted === "up" ? "bg-green-200" : "bg-white"
          }`}
        >
          👍 {upVotes}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`px-1 py-[2px] sm:px-1.5 sm:py-1 rounded border text-xs sm:text-sm ${
            voted === "down" ? "bg-red-200" : "bg-white"
          }`}
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
