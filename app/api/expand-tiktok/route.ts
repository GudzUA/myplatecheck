import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { shortUrl } = await req.json();

  try {
    const res = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    const finalUrl = res.url;

    return NextResponse.json({ fullUrl: finalUrl });
  } catch (error) {
    console.error("❌ TikTok expand error:", error);
    return NextResponse.json({ error: "Не вдалося розширити посилання" }, { status: 500 });
  }
}
