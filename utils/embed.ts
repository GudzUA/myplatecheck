export function getEmbedHTML(url: string): string | null {
  // YouTube
  if (/youtu\.be|youtube\.com/.test(url)) {
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (videoIdMatch) {
      const id = videoIdMatch[1];
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

 // TikTok
if (/tiktok\.com/.test(url)) {
  return `
    <blockquote class="tiktok-embed" cite="${url}" data-video-id="" style="max-width: 325px; min-height: 600px;"></blockquote>
    <script async src="https://www.tiktok.com/embed.js"></script>
  `;
}


// Facebook (тільки якщо це справжнє відео-посилання)
if (/facebook\.com/.test(url) && /\/videos?\//.test(url)) {
  return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
    url
  )}&show_text=0" width="400" height="300" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen></iframe>`;
}


  // Instagram
  if (/instagram\.com/.test(url)) {
    return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="max-width: 100%;"></blockquote>
    <script async src="//www.instagram.com/embed.js"></script>`;
  }

  return null;
}
