// components/InputModal.tsx
"use client";

import { useEffect, useState } from "react";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  type: "login" | "plate" | "password" | null;
  onClose: () => void;
  onSubmit: {
    login: (value: string) => void;
    plate: (value: string) => void;
    password: (value: { oldPassword: string; newPassword: string }) => void;
  };
};

export default function InputModal({ type, onClose, onSubmit }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [value, setValue] = useState<string | { oldPassword: string; newPassword: string }>("");

  useEffect(() => {
    if (type === "login" || type === "plate") setValue("");
    if (type === "password") setValue({ oldPassword: "", newPassword: "" });
  }, [type]);

  if (!type) return null;

  const handleSubmit = () => {
    if (type === "login" && typeof value === "string") return onSubmit.login(value);
    if (type === "plate" && typeof value === "string") return onSubmit.plate(value);
    if (type === "password" && typeof value !== "string") return onSubmit.password(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[80%] max-w-sm border border-gray-200">
        {type === "login" && (
          <>
            <h2 className="text-lg font-semibold text-blue-900 mb-4">{t.change_login}</h2>
            <input
              value={value as string}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.prompt_new_login}
              maxLength={10}
              className="w-full border rounded px-3 py-1 text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </>
        )}

        {type === "plate" && (
          <>
            <h2 className="text-lg font-semibold text-blue-900 mb-4">{t.change_plate}</h2>
            <input
              value={value as string}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder={t.placeholder_new_plate}
              maxLength={7}
              className="w-full border rounded px-3 py-1 text-sm border border-gray-300 p-2 rounded uppercase focus:outline-none focus:ring focus:ring-blue-300"
            />
          </>
        )}

        {type === "password" && (
          <>
            <h2 className="text-lg font-semibold text-blue-900 mb-4">{t.change_password}</h2>
            <input
              type="password"
              placeholder={t.prompt_old_password}
              value={typeof value === "string" ? "" : value.oldPassword}
              onChange={(e) =>
                setValue((prev) =>
                  typeof prev === "string"
                    ? { oldPassword: e.target.value, newPassword: "" }
                    : { ...prev, oldPassword: e.target.value }
                )
              }
              className="w-full border rounded px-3 py-1 text-sm border border-gray-300 p-2 rounded mb-3 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="password"
              placeholder={t.prompt_new_password}
              value={typeof value === "string" ? "" : value.newPassword}
              onChange={(e) =>
                setValue((prev) =>
                  typeof prev === "string"
                    ? { oldPassword: "", newPassword: e.target.value }
                    : { ...prev, newPassword: e.target.value }
                )
              }
              className="w-full border rounded px-3 py-1 text-sm border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded bg-gray-200 text-gray-700"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="px-2 py-1 rounded bg-blue-700 text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
