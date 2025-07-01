import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { translations } from "@/translations";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message } = await req.json();
    const lang = req.headers.get("accept-language")?.split(",")[0]?.split("-")[0] || "ua";

    if (!email || !subject || !lang) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ❌ Перевірка чи користувач відписався
    const unsubscribed = await prisma.unsubscribe.findUnique({ where: { email } });
    if (unsubscribed) {
      console.log(`🚫 Email NOT sent — ${email} is unsubscribed`);
      return NextResponse.json({ success: false, unsubscribed: true }, { status: 200 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const translatedSubject = getTranslatedSubject(subject, lang);
    const translatedMessage = getTranslatedMessage(message, lang);

    const token = Buffer.from(`${email}:${randomUUID()}`).toString("base64url");
const unsubscribeUrl = `https://myplatecheck.vercel.app/api/unsubscribe?token=${token}`;

// 👇 Переклад повідомлення про відписку
const t = translations[lang.toUpperCase() as "UA" | "EN" | "FR"] || translations.UA;
const unsubscribeNotice = t.unsubscribe_notice?.replace("{url}", unsubscribeUrl) || `If you no longer want to receive these emails, click here: ${unsubscribeUrl}`;

// 👇 Повне HTML повідомлення
const htmlContent = `
  <div style="font-family:sans-serif; font-size:14px;">
    <p>${translatedMessage}</p>
    <hr style="margin:20px 0; border:0; border-top:1px solid #ccc;" />
    <p style="font-size:12px; color:#888;">${unsubscribeNotice}</p>
  </div>
`;

// ✅ Відправка з повним HTML
await transporter.sendMail({
  from: `MyPlateCheck <${process.env.SMTP_USER}>`,
  to: email,
  subject: translatedSubject,
  html: htmlContent,
});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Email send error:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

function getTranslatedSubject(subject: string, lang: string): string {
  if (subject === "comment_rejected") {
    if (lang === "fr") return "Votre commentaire a été rejeté ❌";
    if (lang === "en") return "Your comment was rejected ❌";
    return "Ваш коментар відхилено ❌";
  }
  if (subject === "comment_approved") {
    if (lang === "fr") return "Votre commentaire a été publié ✅";
    if (lang === "en") return "Your comment was published ✅";
    return "Ваш коментар опубліковано ✅";
  }
  return subject;
}

function getTranslatedMessage(message: string, lang: string): string {
  // якщо є причина відхилення
  if (message.startsWith("REJECTED:")) {
    const [, plate, reason] = message.match(/^REJECTED:(.+?):(.+)$/) || [];

    if (!plate || !reason) {
      return lang === "fr"
        ? "Votre commentaire a été rejeté sans raison précisée."
        : lang === "en"
        ? "Your comment was rejected without a specified reason."
        : "Ваш коментар було відхилено без вказаної причини.";
    }

    if (lang === "fr") {
      return `Votre commentaire sur la plaque ${plate} a été rejeté par le modérateur. Raison : ${getReasonText(reason, lang)}`;
    }
    if (lang === "en") {
      return `Your comment on plate ${plate} was rejected by the moderator. Reason: ${getReasonText(reason, lang)}`;
    }
    return `Ваш коментар до номеру ${plate} було відхилено модератором. Причина: ${getReasonText(reason, lang)}`;
  }

  // якщо схвалено
  const plate = message;
  if (lang === "fr") return `Votre commentaire sur la plaque ${plate} a été publié avec succès. Merci !`;
  if (lang === "en") return `Your comment on plate ${plate} was successfully published. Thank you!`;
  return `Ваш коментар до номеру ${plate} успішно опубліковано. Дякуємо!`;
}

function getReasonText(reason: string, lang: string): string {
  if (reason === "image_violation") {
    if (lang === "fr") return "Violation d'image (visages, informations privées)";
    if (lang === "en") return "Image violation (faces, private info)";
    return "Порушення у зображенні (обличчя, приватна інформація)";
  }

  if (reason === "inappropriate_text") {
    if (lang === "fr") return "Texte offensant ou inapproprié";
    if (lang === "en") return "Offensive or inappropriate text";
    return "Образливий або неприйнятний текст";
  }

  if (reason === "spam") {
    if (lang === "fr") return "Spam ou contenu promotionnel";
    if (lang === "en") return "Spam or promotional content";
    return "Спам або рекламний вміст";
  }

  // fallback
  return reason;
}
