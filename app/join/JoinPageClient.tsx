"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import LoginRegisterModal from "@/components/LoginRegisterModal";
import ModalAlert from "@/components/ModalAlert";


export default function JoinPageClient() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [validCode, setValidCode] = useState(false);
  const [code, setCode] = useState("");
  const [showAlreadyProModal, setShowAlreadyProModal] = useState(false);

  useEffect(() => {
    const paramCode = searchParams.get("code") || "";
    if (paramCode === "PRO2025") {
      setValidCode(true);
      setCode(paramCode);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  const handleClick = () => {
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      const payments = user.paymentHistory;
      const isPro =
        user?.pro === true ||
        user?.type === "pro" ||
        (Array.isArray(payments)
          ? payments.some(p => ["promo", "manual", "stripe"].includes(p?.type))
          : ["promo", "manual", "stripe"].includes(payments?.type));

      if (isPro) {
        setShowAlreadyProModal(true);
        setTimeout(() => {
          setShowAlreadyProModal(false);
          router.push("/");
        }, 2500);
        return;
      }
    } catch (e) {
      console.error("❌ Failed to parse user from localStorage:", e);
    }
  }

  setShowModal(true);
};



  return validCode ? (
    <main className="max-w-xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        {t.join_offer_title}
      </h1>
      <p className="text-lg text-gray-700 mb-4">{t.join_offer_text}</p>
      <ul className="text-left text-gray-700 mb-6 list-disc list-inside">
        <li>{t.join_offer_list_1}</li>
        <li>{t.join_offer_list_2}</li>
        <li>{t.join_offer_list_3}</li>
        <li>{t.join_offer_list_4}</li>
      </ul>
      <p className="text-red-600 font-medium mb-6">{t.join_offer_warning}</p>
      <button
        onClick={handleClick}
        className="bg-blue-800 text-white text-lg px-6 py-2 rounded hover:bg-blue-900 transition"
      >
        {t.join_offer_button}
      </button>

      {showModal && (
        <LoginRegisterModal
          onClose={() => setShowModal(false)}
          promoCode={code}
        />
      )}
{showAlreadyProModal && (
 <ModalAlert
  show={true}
  title={t.attention}
  message={t.must_be_PRO_to_subscribe}
  mode={undefined}
  onClose={() => {
    setShowAlreadyProModal(false);
    router.push("/");
  }}
/>
)}
    </main>
  ) : null;
}
