"use client";

import { useEffect, useState } from "react";

type Props = {
  plate: string;
  interactive?: boolean;
};

export default function PlateRatingBlock({ plate, interactive = false }: Props) {
  const [votes, setVotes] = useState({ up: 0, down: 0 });

  useEffect(() => {
    setVotes(getTotalVotesForPlate(plate));
  }, [plate]);

  const handleVote = (type: "up" | "down") => {
    const stored = localStorage.getItem("comments");
    const all = stored ? JSON.parse(stored) : [];

    for (const comment of all) {
      if ((comment.plate || "").toUpperCase().replace(/\s+/g, "") === plate.toUpperCase().replace(/\s+/g, "")) {
        const key = `rating-${comment.id}`;
        const raw = localStorage.getItem(key);
        const rating = raw ? JSON.parse(raw) : { up: 0, down: 0 };

        if (type === "up") rating.up += 1;
        else rating.down += 1;

        localStorage.setItem(key, JSON.stringify(rating));
      }
    }

    setVotes(getTotalVotesForPlate(plate));
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        disabled={!interactive}
        onClick={() => handleVote("up")}
        className={`px-2 py-1 rounded border flex items-center gap-1 text-sm font-medium ${
          interactive ? "bg-white hover:bg-green-120" : "bg-green-200"
        }`}
      >
        👍 <span>{votes.up}</span>
      </button>
      <button
        disabled={!interactive}
        onClick={() => handleVote("down")}
        className={`px-2 py-1 rounded border flex items-center gap-1 text-sm font-medium ${
          interactive ? "bg-white hover:bg-red-120" : "bg-red-200"
        }`}
      >
        👎 <span>{votes.down}</span>
      </button>
    </div>
  );
}

function getTotalVotesForPlate(plate: string) {
  const stored = localStorage.getItem("comments");
  const all = stored ? JSON.parse(stored) : [];

  let up = 0;
  let down = 0;

  for (const comment of all) {
    if ((comment.plate || "").toUpperCase().replace(/\s+/g, "") === plate.toUpperCase().replace(/\s+/g, "")) {
      const raw = localStorage.getItem(`rating-${comment.id}`);
      if (raw) {
        const r = JSON.parse(raw);
        up += r.up || 0;
        down += r.down || 0;
      }
    }
  }

  return { up, down };
}

