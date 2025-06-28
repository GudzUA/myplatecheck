export function getEmbedHTML(url: string): string | null {
  if (!url) return null;

  // ✅ TikTok
  if (url.includes("tiktok.com")) {
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match?.[1];
    if (!videoId) return null;

    return `
      <blockquote class="tiktok-embed"
        cite="${url}"
        data-video-id="${videoId}"
        style="max-width: 100%; min-width: 300px; margin: 0 auto;">
        <section></section>
      </blockquote>
    `;
  }

  // ✅ YouTube
  if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      return \`<iframe width="100%" height="315"
        src="https://www.youtube.com/embed/${match[1]}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>\`;
    }
  }

  // ✅ Facebook
  if (url.includes("facebook.com") && url.includes("/videos/")) {
    const encodedUrl = encodeURIComponent(url);
    return \`
      <iframe
        src="https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500"
        width="100%" height="280"
        style="border:none;overflow:hidden"
        scrolling="no"
        frameborder="0"
        allowfullscreen="true">
      </iframe>
    \`;
  }

  // ✅ Instagram POST
  if (url.includes("instagram.com/p/")) {
    return \`
      <blockquote
        class="instagram-media"
        data-instgrm-permalink="${url}"
        data-instgrm-version="14"
        style="width:100%; max-width:540px; max-height:400px; overflow:hidden; margin: 0 auto;">
      </blockquote>
    \`;
  }

  // 🟨 Instagram Reels (немає embed) — fallback кнопка
  if (url.includes("instagram.com/reel/")) {
    return \`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">
      Переглянути в Instagram
    </a>\`;
  }

  return null;
}