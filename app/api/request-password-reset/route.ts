// app/api/request-password-reset/route.ts

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

type User = {
  email: string;
  resetToken?: string;
  resetExpires?: number;
  [key: string]: unknown;
};

export async function POST(req: Request) {
  const { email }: { email: string } = await req.json();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "missing_email" },
      { status: 400 }
    );
  }

  const usersRaw = localStorage.getItem("users") || "[]";
  const users: User[] = JSON.parse(usersRaw);
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email === normalizedEmail);

  // Навіть якщо користувача нема — не розкриваємо це
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = uuidv4();
  user.resetToken = token;
  user.resetExpires = Date.now() + 15 * 60 * 1000; // 15 хвилин

  const updatedUsers = users.map((u) =>
    u.email === user.email ? user : u
  );
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}&email=${normalizedEmail}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MyPlateCheck" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Відновлення паролю",
      html: `<p>Щоб відновити пароль, перейдіть за посиланням:</p><a href="${url}">${url}</a>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Email send error:", err);
    return NextResponse.json(
      { success: false, error: "email_send_error" },
      { status: 500 }
    );
  }
}
