"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type Props = {
  plate: string;
  email?: string;
  province: string;
};

export default function DriverRatingBlock({ plate, email, province }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [upVotes, setUpVotes] = useState(0);
  const [downVotes, setDownVotes] = useState(0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showModal, setShowModal] = useState(false);

useEffect(() => {
  fetch(`/api/driver-rating?plate=${plate}&email=${email || "guest"}&province=${province}`)
    .then((res) => res.json())
    .then((data) => {
      setUpVotes(data.up || 0);
      setDownVotes(data.down || 0);
      if (data.userVote) setVoted(data.userVote);
    })
    .catch((err) => console.error("Load driver rating error:", err));
}, [plate, email, province]); 

  const handleVote = async (type: "up" | "down") => {
    if (voted) {
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch("/api/driver-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate,
          email: email || "guest",
          type,
          province,
        }),
      });

      if (res.ok) {
        if (type === "up") setUpVotes((prev) => prev + 1);
        else setDownVotes((prev) => prev + 1);
        setVoted(type);
      } else if (res.status === 409) {
        setShowModal(true);
      } else {
        const errText = await res.text();
        console.error("Driver vote failed:", res.status, errText);
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
          } border`}
        >
          👍 {upVotes}
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`px-1 py-[2px] sm:px-1.5 sm:py-1 rounded border text-xs sm:text-sm ${
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
