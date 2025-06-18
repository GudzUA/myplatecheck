// app/upgrade-success/UpgradeSuccessContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalAlert from "../../components/ModalAlert";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

type User = {
  email: string;
  login?: string;
  pro?: boolean;
  type?: string;
  tariff?: string;
  proUntil?: string;
  paymentHistory?: any[];
  badges?: string[];
};

export default function UpgradeSuccessContent() {
  const [showModal, setShowModal] = useState(true);
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      const sessionId = params.get("session_id");
      const plan = params.get("plan") || "daily";

      const raw = localStorage.getItem("user");
      if (!sessionId || !raw) {
        setShowModal(false);
        router.push("/account");
        return;
      }

      const existingUser = JSON.parse(raw);
      const userEmail = existingUser.email;

      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, plan, email: userEmail }),
        });

        const data = await res.json();

        if (data.success) {
          const updatedUser = {
            ...existingUser,
            email: userEmail,
            pro: true,
            type: "pro",
            tariff: plan,
            proUntil: data.updatedUser?.proUntil || existingUser.proUntil,
            paymentHistory: data.updatedUser?.paymentHistory || [],
            badges: Array.isArray(existingUser.badges)
              ? [...new Set([...existingUser.badges, "pro"])]
              : ["pro"],
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("userUpdated"));

          const rawUsers = localStorage.getItem("users");
          const users: User[] = rawUsers ? JSON.parse(rawUsers) : [];
          const normalizedEmail = userEmail.trim().toLowerCase();

          let userUpdated = false;
          const updatedUsers = users.map((u: User) => {
            if (u.email?.trim().toLowerCase() === normalizedEmail) {
              userUpdated = true;
              return { ...u, ...updatedUser };
            }
            return u;
          });

          if (!userUpdated) updatedUsers.push(updatedUser);

          localStorage.setItem("users", JSON.stringify(updatedUsers));

          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              subject: "Дякуємо за підтримку MyPlateCheck",
              message: `Ваш PRO активовано до ${new Date(updatedUser.proUntil).toLocaleDateString()}.`,
            }),
          });

          window.dispatchEvent(new Event("storage"));
          setTimeout(() => router.push("/account"), 2500);
        } else {
          setShowModal(false);
          router.push("/account");
        }
      } catch (error) {
        console.error("❌ Verification error:", error);
        setShowModal(false);
        router.push("/account");
      }
    };

    verify();
  }, [params, router, t]);

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      {showModal && (
        <ModalAlert
          show={true}
          title={t.title_info}
          message={t.pro_success}
          onClose={() => {
            setShowModal(false);
            window.location.href = "/account";
          }}
        />
      )}
    </main>
  );
}
