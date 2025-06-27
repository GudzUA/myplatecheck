export function getEmbedHTML(url: string): string | null {
  if (!url) return null;

  // TikTok
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

  // YouTube
 if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.includes("youtube.com")
      ? new URL(url).searchParams.get("v")
      : url.split("/").pop();
    if (!videoId) return null;
    return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" 
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; 
      picture-in-picture" allowfullscreen></iframe>`;
  }

  return null;
}
