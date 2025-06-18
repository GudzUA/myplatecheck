'use client'

import { useState } from 'react'
import ModalAlert from '../../components/ModalAlert'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../translations'
import Image from 'next/image'

export default function UpgradePage() {
  const { lang } = useLanguage()
  const t = translations[lang]
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

 const handleUpgrade = async (plan: 'daily' | 'monthly' | 'yearly') => {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user || !user.email || !user.login) {
    alert("Ви повинні бути зареєстрованим користувачем, щоб оформити підписку.");
    return;
  }
const now = new Date();
const proUntil = user?.proUntil ? new Date(user.proUntil) : null;

if (user?.pro && proUntil && proUntil > now) {
  alert("У вас вже активний PRO. Ви не можете оформити нову підписку поки вона не завершилась.");
  return;
}

  setIsProcessing(true);

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json();
  setIsProcessing(false);

  if (data?.url) {
    window.location.href = data.url;
  } else {
    setModalMessage(t.error_generic);
  }
};


  return (

    <main className="max-w-2xl mx-auto px-4 py-10">

      {/* 1 DAY */}
      <div className="border border-blue-400 bg-white rounded-xl shadow-md p-6 mb-5">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">
          ☀️ {t.day} – <span className="text-blue-800 font-bold">0.99 CAD+Tax</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t.day_info}</p>
        <button
          onClick={() => handleUpgrade('daily')}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isProcessing ? 'Обробка…' : t.buy_day}
        </button>
      </div>

      {/* 1 MONTH */}
      <div className="border border-yellow-400 bg-white rounded-xl shadow-md p-6 mb-5">
        <h2 className="text-xl font-semibold text-yellow-600 mb-2">
          📅 {t.month} – <span className="text-yellow-600 font-bold">3.99 CAD+Tax</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t.monthly_info}</p>
        <button
          onClick={() => handleUpgrade('monthly')}
          className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
        >
          {isProcessing ? 'Обробка…' : t.buy_month}
        </button>
      </div>

      {/* 1 YEAR */}
      <div className="border border-green-400 bg-white rounded-xl shadow-md p-6 mb-5">
        <h2 className="text-xl font-semibold text-green-700 mb-2">
          🗓️ {t.year} – <span className="text-green-700 font-bold">23.94 CAD+Tax</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t.yearly_info}</p>
        <button
          onClick={() => handleUpgrade('yearly')}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {isProcessing ? 'Обробка…' : t.buy_year}
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
            setModalMessage(null)
            window.location.reload()
          }}
        >
          <button
            onClick={() => {
              setModalMessage(null)
              window.location.reload()
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {t.ok_button}
          </button>
        </ModalAlert>
      )}
    </main>
  )
}
