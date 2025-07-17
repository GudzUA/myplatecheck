"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import Image from "next/image";
import ModalAlert from "@/components/ModalAlert";
import LoginRegisterModal from "@/components/LoginRegisterModal";

export default function BannerAd() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

const handlePromoUpgrade = async () => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user || !user.email || !user.login || user.email.startsWith("guest")) {
    setModalMessage(t.must_be_registered_to_subscribe);
    return;
  }

  if (user?.pro) {
    setModalMessage(t.must_be_PRO_to_subscribe);
    return;
  }

  setIsProcessing(true);

  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: "promo" }),
  });

  const data = await res.json();
  setIsProcessing(false);

  if (data?.url) {
    window.location.href = data.url; // 🔥 одразу відкриваємо Stripe
  } else {
    setModalMessage(t.error_generic);
  }
};


  return (
    <div className="w-full bg-transparent px-4 py-4">
      <div className="max-w-screen-xl mx-auto">
        <button onClick={handlePromoUpgrade} className="block w-full">
          <Image
            src="/ads/add.png"
            alt={t.advert}
            width={1400}
            height={70}
            className="w-full object-contain rounded shadow-md cursor-pointer"
          />
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center flex flex-col items-center space-y-4">
            <Image
              src="/spinner.svg"
              alt="Loading..."
              width={48}
              height={48}
              className="animate-spin"
            />
            <div className="text-lg font-semibold text-blue-800">
              {t.payment_processing}
            </div>
          </div>
        </div>
      )}

      {modalMessage && (
        <ModalAlert
          show={true}
          title={t.title_info}
          message={modalMessage}
          onClose={() => {
            setModalMessage(null);
            setShowLogin(true);
          }}
        >
          <button
            onClick={() => {
              setModalMessage(null);
              setShowLogin(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {t.ok_button}
          </button>
        </ModalAlert>
      )}

      {showLogin && <LoginRegisterModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
