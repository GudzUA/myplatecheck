// /api/unsubscribe/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return new Response("Invalid or missing token.", { status: 400 });
    }

    // Розшифровуємо токен (base64url → email:uuid)
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [email] = decoded.split(":");

    if (!email || !email.includes("@")) {
      return new Response("Invalid token structure.", { status: 400 });
    }

    // Перевірка, чи вже є
    const existing = await prisma.unsubscribe.findUnique({ where: { email } });

    if (!existing) {
      await prisma.unsubscribe.create({ data: { email } });
    }

    return new Response(
      `
        <html>
          <head><title>Unsubscribed</title></head>
          <body style="font-family:sans-serif;text-align:center;padding-top:60px;">
            <h2>You have successfully unsubscribed from MyPlateCheck emails.</h2>
            <p style="margin-top:20px;color:gray;">If this was a mistake, contact us to resubscribe.</p>
          </body>
        </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("❌ Unsubscribe error:", err);
    return new Response("Server error", { status: 500 });
  }
}
