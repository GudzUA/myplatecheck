import React from "react";

export function renderMediaFromComment(comment: string): React.ReactNode {
  const parts = comment.split(/(\s+)/); // зберігаємо пробіли
  return (
    <>
      {parts.map((part, i) => {
        const trimmed = part.trim();

        // YouTube
        if (trimmed.includes("youtube.com/watch") || trimmed.includes("youtu.be")) {
          const videoIdMatch =
            trimmed.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          const videoId = videoIdMatch?.[1];
          if (videoId) {
            return (
              <div key={i} className="my-3">
                <iframe
                  width="300"
                  height="170"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allowFullScreen
                  className="rounded"
                />
              </div>
            );
          }
        }

        // TikTok
        if (trimmed.includes("tiktok.com")) {
          return (
            <blockquote
              key={i}
              className="tiktok-embed"
              cite={trimmed}
              style={{ maxWidth: "300px", margin: "1rem 0" }}
            >
              <a href={trimmed}>TikTok</a>
            </blockquote>
          );
        }

        // Facebook
        if (trimmed.includes("facebook.com")) {
          return (
            <div key={i} className="my-3">
              <iframe
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false`}
                width="300"
                height="170"
                allowFullScreen
                className="rounded"
              />
            </div>
          );
        }

        // Instagram
        if (trimmed.includes("instagram.com")) {
          return (
            <a
              key={i}
              href={trimmed}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              {trimmed}
            </a>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
