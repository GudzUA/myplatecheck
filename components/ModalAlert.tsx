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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-xl p-6 text-center relative">
        {/* Хрестик закрити */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          aria-label={t.close}
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Центровані кастомні кнопки (наприклад, “OK”) */}
        {children && (
          <div className="flex justify-center mt-4">{children}</div>
        )}

        {/* Кнопки для входу або покупки */}
        <div className="flex justify-center gap-4 mb-2">
          {mode === "login" && (
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 bg-gray-900 text-white font-medium px-5 py-2 rounded hover:bg-black transition w-full"
            >
              <FaLock className="text-sm" />
              {t.login_button}
            </button>
          )}
          {mode && (
            <button
              onClick={onUpgrade}
              className="flex items-center justify-center gap-2 bg-yellow-500 text-white font-medium px-5 py-2 rounded hover:bg-yellow-600 transition w-full"
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

