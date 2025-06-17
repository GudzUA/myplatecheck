"use client";

import { useEffect, useState } from "react";
import { sendNotification } from "../../../utils/sendNotification";
import Image from "next/image";


type Comment = {
  id: string;
  comment: string;
  plate: string;
  province: string;
  createdAt: string;
  author: string;
  pending?: boolean;
  email?: string;             
  media?: {
    name: string;
    type: string;
    url: string;
  }[];                    
};
export default function ModerationPage() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReasonSelector, setShowReasonSelector] = useState(false);
  const [cancelReason, setCancelReason] = useState("");



  useEffect(() => {
    const raw = localStorage.getItem("comments");
    if (raw) {
      const all: Comment[] = JSON.parse(raw);
      const filtered = all.filter((c) => c.pending === true);
      setPendingComments(filtered);
    }
  }, []);

 const allowComment = (id: string) => {
  const raw = localStorage.getItem("comments");
  if (!raw) return;
  const all: Comment[] = JSON.parse(raw);
  const comment = all.find((c) => c.id === id);
  if (comment?.email) {
    sendNotification(
      comment.email,
      "Ваш коментар опубліковано",
      "Ваш коментар пройшов модерацію і опублікований на сайті."
    );
  }

  const updated = all.map((c) => c.id === id ? { ...c, pending: false } : c);
  localStorage.setItem("moderationStatus", "approved"); 
  localStorage.setItem("comments", JSON.stringify(updated));
  setPendingComments(updated.filter((c) => c.pending));
};

const deleteComment = (id: string) => {
  const raw = localStorage.getItem("comments");
  if (!raw) return;
  const all: Comment[] = JSON.parse(raw);
  const comment = all.find((c) => c.id === id);
  if (comment?.email) {
    sendNotification(
      comment.email,
      "Ваш коментар відхилено",
      "Ваш коментар було відхилено модератором і не буде опубліковано."
    );
  }

  const updated = all.filter((c) => c.id !== id);
  localStorage.setItem("comments", JSON.stringify(updated));
  localStorage.setItem("moderationStatus", "approved");
  setPendingComments(updated.filter((c) => c.pending));
};

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🛠 Модерація коментарів</h1>

      {pendingComments.length === 0 ? (
        <p className="text-gray-500">Немає коментарів на модерацію.</p>
      ) : (
        <ul className="space-y-4">
          {pendingComments.map((c) => (
            <li key={c.id} className="bg-white p-4 border border-blue-200 rounded shadow-sm">
              <div className="text-sm text-gray-500 mb-1">
                <strong>{c.plate}</strong> • {c.province} • {new Date(c.createdAt).toLocaleString()}
              </div>
{Array.isArray(c.media) && c.media[0]?.type?.startsWith("image") && c.media[0]?.url && (
  <div className="mt-2">
    <Image
      src={c.media[0].url}
      alt="media"
      width={200}
      height={150}
      className="cursor-pointer rounded hover:shadow-lg hover:scale-105 transition object-contain"
      onClick={() => setFullscreenImage(c.media?.[0]?.url || "")}
    />
  </div>
)}

<p className="mb-3">{c.comment}</p>
<div className="flex flex-col gap-2 items-end">
  <button
    onClick={() => allowComment(c.id)}
    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
  >
    Дозволити
  </button>

  {selectedId === c.id && showReasonSelector ? (
    <div className="flex flex-col gap-2 items-end w-full">
      <select
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      >
        <option value="">Оберіть причину...</option>
        <option value="image_violation">Порушення у зображенні</option>
        <option value="inappropriate_text">Образливий текст</option>
        <option value="spam">Спам / реклама</option>
      </select>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            if (!cancelReason) return alert("Оберіть причину");
            deleteComment(c.id);
            setSelectedId(null);
            setShowReasonSelector(false);
            setCancelReason("");
          }}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Підтвердити
        </button>
        <button
          onClick={() => {
            setSelectedId(null);
            setShowReasonSelector(false);
            setCancelReason("");
          }}
          className="text-sm text-gray-500 underline"
        >
          Скасувати
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => {
        setSelectedId(c.id);
        setShowReasonSelector(true);
      }}
      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
    >
      Видалити
    </button>
  )}
</div>

            </li>
          ))}
        </ul>
      )}
{fullscreenImage && (
  <div
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
    onClick={() => setFullscreenImage(null)}
  >
    <Image
  src={fullscreenImage}
  alt="fullscreen"
  width={800}
  height={600}
  className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border-2 border-white object-contain"
/>
  </div>
)}
    </main>
  );
}
