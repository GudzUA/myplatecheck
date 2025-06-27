import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import { translations } from "@/translations";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Визначаємо мову з заголовка (Accept-Language)
const acceptLanguage = req.headers.get("accept-language") || "";
const rawLang = acceptLanguage.split(",")[0]; // "en-US"
const lang = rawLang.toLowerCase().startsWith("fr")
  ? "FR"
  : rawLang.toLowerCase().startsWith("en")
  ? "EN"
  : "UA";

const t = translations[lang as keyof typeof translations];


        const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true }); // щоб не видавати, що нема користувача
  }

const existing = await prisma.passwordResetToken.findFirst({
  where: {
    userId: user.id,
    expires: { gt: new Date() }, 
  },
});

if (existing) {
  return NextResponse.json({ success: true, message: "Email already sent recently" });
}

await prisma.passwordResetToken.deleteMany({
  where: { userId: user.id },
});

  const token = uuidv4();
  const expires = new Date(Date.now() + 1000 * 60 * 10); 

 await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });


// 🟦 Відправляємо лист
const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?email=${encodeURIComponent(
  email
)}&token=${token}`;


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
  to: email,
  subject: t.reset_email_subject,
  html: `
    <p>${t.reset_email_line1}</p>
    <p>${t.reset_email_line2}</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>${t.reset_email_line3}</p>
  `,
});



return NextResponse.json({ success: true });
}
