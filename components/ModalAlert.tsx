"use client";

import { ReactNode } from "react";
import { FaLock, FaStar, FaTimes } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

type ModalAlertProps = {
  show: boolean;
  title: string;
  message: string;
  mode?: "login" | "upgrade";
  onLogin?: () => void;
  onUpgrade?: () => void;
  onClose: () => void;
  children?: ReactNode;
};

const ModalAlert: React.FC<ModalAlertProps> = ({
  show,
  title,
  message,
  mode,
  onLogin,
  onUpgrade,
  onClose,
  children,
}) => {
  const { lang } = useLanguage();
  const t = translations[lang];

  if (!show) return null;

  return (
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-2">
  <div className="bg-white w-full max-w-[90%] sm:max-w-md rounded-lg shadow-xl p-4 sm:p-6 text-center relative">
    {/* Хрестик */}
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
      aria-label={t.close}
    >
      <FaTimes />
    </button>

    <h2 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
    <p className="text-sm sm:text-base text-gray-600 mb-6">{message}</p>

    {children && (
      <div className="flex justify-center mt-4">{children}</div>
    )}

    <div className="flex flex-col sm:flex-row justify-center gap-3 mb-2">
      {mode === "login" && (
        <button
          onClick={onLogin}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white font-medium px-4 py-2 rounded hover:bg-black transition text-sm sm:text-base w-full sm:w-auto"
        >
          <FaLock className="text-sm" />
          {t.login_button}
        </button>
      )}
      {mode && (
        <button
          onClick={onUpgrade}
          className="flex items-center justify-center gap-2 bg-yellow-500 text-white font-medium px-4 py-2 rounded hover:bg-yellow-600 transition text-sm sm:text-base w-full sm:w-auto"
        >
          <FaStar className="text-sm" />
          {t.buy_pro}
        </button>
      )}
    </div>
  </div>
</div>

  );
};

export default ModalAlert;

