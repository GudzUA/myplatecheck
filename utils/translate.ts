export async function translateComment(
  commentId: string,
  originalText: string,
  targetLang: 'ua' | 'fr' | 'en'
): Promise<string | null> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentId, targetLang, originalText }),
    });

    if (!res.ok) {
      console.error('Translation API error:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.translation?.text || null;
  } catch (err) {
    console.error('Fetch failed:', err);
    return null;
  }
}
