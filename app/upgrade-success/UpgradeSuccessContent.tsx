// app/upgrade-success/UpgradeSuccessContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { lang } = useLanguage();
  const t = translations[lang];
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    console.log("📦 sessionId from URL:", sessionId);
    const stored = localStorage.getItem("user");

    if (!sessionId || !stored) {
      console.error("❌ No sessionId or user in localStorage");
      setStatus("error");
      return;
    }

    const parsed = JSON.parse(stored);
    const email = parsed?.email;

    console.log("📧 email from localStorage:", email);

    if (!email) {
      console.error("❌ No email in stored user");
      setStatus("error");
      return;
    }

    // 🔁 Верифікація платежу
    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Response from /api/verify-payment:", data);

        if (data?.error) {
          console.error("❌ Payment verification error:", data.error);
          setStatus("error");
        } else {
          localStorage.setItem("user", JSON.stringify(data));
          window.dispatchEvent(new Event("userUpdated"));
          setStatus("success");
        }
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setStatus("error");
      });
  }, [sessionId]);

  if (status === "loading") return <div className="text-center py-10">{t.payment_checking || "Перевірка платежу..."}</div>;
  if (status === "error") return <div className="text-center py-10 text-red-600">{t.payment_failed || "Не вдалося підтвердити платіж."}</div>;

  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-bold text-green-700 mb-4">{t.payment_success || "Платіж успішний!"}</h1>
      <p className="text-gray-700 mb-4">{t.payment_success_details || "Ваша підписка активована. Дякуємо!"}</p>
      <button
        onClick={() => router.push("/account")}
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
      >
        {t.to_account || "Перейти в акаунт"}
      </button>
    </div>
  );
}
