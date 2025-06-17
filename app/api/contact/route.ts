import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // ✅ 465 = secure
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

await transporter.sendMail({
  from: `"MyPlateCheck" <${process.env.SMTP_USER}>`,
  to: email || process.env.CONTACT_RECEIVER_EMAIL,
  subject: `Контакт з сайту від ${name}`,
  html: `
    <h2>Нове повідомлення з сайту</h2>
    ${name ? `<p><strong>Ім’я:</strong> ${name}</p>` : ""}
    ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
    <p><strong>Повідомлення:</strong></p>
    <p>${message?.replace(/\n/g, "<br/>")}</p>
  `,
});


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Email send error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
