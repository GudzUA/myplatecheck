import { NextRequest, NextResponse } from "next/server";

// Лайт-версія без Stripe для старту на Vercel
export async function POST(req: NextRequest) {
  const { plan } = await req.json();

  // Просто перенаправляємо користувача на фейкову сторінку успіху
  const successUrl = `${req.headers.get("origin")}/upgrade-success?session_id=demo_session&plan=${plan}`;

  return NextResponse.json({ url: successUrl });
}
