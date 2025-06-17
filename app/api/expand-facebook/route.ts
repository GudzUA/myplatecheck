import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { shortUrl } = await req.json();

    if (!shortUrl || typeof shortUrl !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "manual",
    });

    const location = res.headers.get("location");

    if (location && location.startsWith("https://www.facebook.com")) {
      return NextResponse.json({ fullUrl: location });
    }

    return NextResponse.json({ fullUrl: shortUrl }); // якщо не вдалося — повертаємо як є
  } catch (error) {
    return NextResponse.json({ error: "Failed to expand URL" }, { status: 500 });
  }
}
