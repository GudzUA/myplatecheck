import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const shortUrl = req.nextUrl.searchParams.get("url");

  if (!shortUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const res = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });

    return NextResponse.json({ fullUrl: res.url });
  } catch (err) {
    return NextResponse.json({ fullUrl: shortUrl });
  }
}
