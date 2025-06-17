"use client";

import { Comment } from "../types";
import RatingBlock from "./RatingBlock";
import ReplyRatingBlock from "./ReplyRatingBlock";
import { useState } from "react";
import Image from "next/image";

type Props = {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string, text: string) => void;
};

export default function CommentBlock({ comment, replies, onReply }: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded shadow p-4 mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span className="font-semibold">{comment.user || "Анонім"}</span>
        <span className="text-right">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>

      <p className="text-base text-gray-900">{comment.comment}</p>

      {comment.media?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {comment.media.map((m, i) =>
            m.type.startsWith("video") ? (
              <video key={i} src={m.url} controls className="w-full rounded" />
            ) : (
              <Image
                key={i}
                src={m.url}
                alt="media"
                width={300}
                height={200}
                className="w-full rounded object-contain"
              />
            )
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={() => setShowReplyForm((v) => !v)}
          className="text-white bg-black px-3 py-1 rounded text-sm"
        >
          💬 Відповісти
        </button>
        <div className="text-right">
          <RatingBlock commentId={comment.id} />
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-3 bg-white rounded border p-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            placeholder="Напишіть відповідь..."
            className="w-full px-2 py-1 rounded border text-sm"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleSubmit}
              className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Надіслати
            </button>
            <button
              onClick={() => setShowReplyForm(false)}
              className="text-sm text-gray-500"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Відповіді */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-3 pl-3 border-l-2 border-gray-300">
          {replies.map((r) => (
            <div
              key={r.id}
              className="bg-white border rounded p-3 text-sm shadow-sm"
            >
              <div className="flex justify-between text-gray-500 text-xs">
                <span className="font-semibold">{r.user || "Анонім"}</span>
                <span>{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-800 mt-1">{r.comment}</p>
              <div className="text-right mt-2">
                <ReplyRatingBlock replyId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
