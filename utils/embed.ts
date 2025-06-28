export function getEmbedHTML(url: string): string | null {
  if (!url) return null;

  // ✅ TikTok
  if (url.includes("tiktok.com")) {
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match?.[1];
    if (!videoId) return null;

    return `
      <blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px;">
        <section></section>
      </blockquote>
    `;
  }

  // ✅ YouTube
  if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  // ✅ Facebook
  if (url.includes("facebook.com") && url.includes("video")) {
    const encodedUrl = encodeURIComponent(url);
    return `
      <iframe src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500"
        width="100%" height="280" style="border:none;overflow:hidden" scrolling="no" frameborder="0"
        allowfullscreen="true"></iframe>
    `;
  }

  // ❌ Instagram — не підтримуємо повноцінно через блокування
  if (url.includes("instagram.com")) {
    return null; // можна потім показати кнопку "Дивитись в Instagram"
  }

  return null;
}
