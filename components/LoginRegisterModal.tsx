"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import Link from "next/link";
import { assignBadges } from "../utils/badges";


export default function LoginRegisterModal({

  onClose,
  promoCode,
}: {
  onClose: () => void;
  promoCode?: string;
}) {

  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [plate, setPlate] = useState("");
  const { lang } = useLanguage();
  const t = translations[lang];
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [province, setProvince] = useState("");

  const activatePromo = async (email: string): Promise<boolean> => {
    if (!promoCode || promoCode !== "PRO2025") return false;
    try {
      const res = await fetch("/api/activate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: promoCode }),
      });
      return res.ok;
    } catch (err) {
      console.error("❌ Promo activation error:", err);
      return false;
    }
  };

  const refreshUserAndLogin = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/check-user?email=${email}`);
      const user = await res.json();
      console.log("✅ REFRESHED USER", user);

      const userWithBadges = {
  ...user,
  badges: assignBadges(user),
};

localStorage.setItem("user", JSON.stringify(userWithBadges));

// ✅ Діагностична перевірка
const payments = user.paymentHistory;
const isPro =
  user?.pro === true ||
  user?.type === "pro" ||
  (Array.isArray(payments)
    ? payments.some(p => ["promo", "manual", "stripe"].includes(p?.type))
    : ["promo", "manual", "stripe"].includes(payments?.type));

console.log("🟢 isPro =", isPro);

window.dispatchEvent(new Event("userUpdated"));
window.location.reload();

    } catch (err) {
      console.error("❌ Refresh user error:", err);
    }
  };

  const handleLogin = async () => {
    const emailClean = email.trim().toLowerCase();

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailClean, password, type: "login" }),
    });

    if (!res.ok) {
      alert(t.wrong_email_or_password);
      return;
    }

    const found = await res.json();
    const activated = await activatePromo(emailClean);
    if (!activated && promoCode === "PRO2025") {
      alert("Промокод не активовано. Можливо, вже використано.");
    }
    await refreshUserAndLogin(found.email);
  };

  const handleRegister = async () => {
    if (!email || !plate || !password || !confirm) {
      alert(t.fill_all_fields);
      return;
    }

    if (password !== confirm) {
      alert(t.passwords_do_not_match);
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(emailClean)) {
      alert(t.invalid_email_format);
      return;
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailClean,
        login,
        plate,
        password,
        type: "register",
        province,
      }),
    });

    if (!res.ok) {
      const message = await res.text();
      alert(message);
      return;
    }

    const activated = await activatePromo(emailClean);
    if (!activated && promoCode === "PRO2025") {
      alert("Промокод не активовано. Можливо, вже використано.");
    }
    await refreshUserAndLogin(emailClean);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-4 relative sm:w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {mode === "login" ? t.login_title : t.register_title}
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              const allowed = /^[a-zA-Z0-9@._\-+]*$/;
              if (allowed.test(val)) {
                setEmail(val.trim().toLowerCase());
              }
            }}
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder={t.login_placeholder_short}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <div className="flex flex-col sm:flex-row gap-3">
  <input
    type="text"
    placeholder={t.plate_placeholder}
    value={plate}
    onChange={(e) => setPlate(e.target.value.toUpperCase())}
    maxLength={7}
    className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

 <select
  value={province}
  onChange={(e) => setProvince(e.target.value)}
  className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-48 overflow-y-auto"
>
 <option value="">{t.province_placeholder}</option>
  <option value="ontario">Ontario</option>
  <option value="quebec">Quebec</option>
  <option value="manitoba">Manitoba</option>
  <option value="alberta">Alberta</option>
  <option value="british_columbia">British Columbia</option>
  <option value="saskatchewan">Saskatchewan</option>
  <option value="nova_scotia">Nova Scotia</option>
  <option value="new_brunswick">New Brunswick</option>
  <option value="prince_edward_island">Prince Edward Island</option>
  <option value="newfoundland_and_labrador">Newfoundland and Labrador</option>
  <option value="yukon">Yukon</option>
  <option value="northwest_territories">Northwest Territories</option>
  <option value="nunavut">Nunavut</option>  </select>
</div>
            </>
          )}

          <input
            type="password"
            placeholder={t.password_placeholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mode === "register" && (
            <input
              type="password"
              placeholder={t.confirm_password_placeholder}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <button
            onClick={mode === "login" ? handleLogin : handleRegister}
            className="w-full py-2 px-2 text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {mode === "login" ? t.login_title : t.register_title}
          </button>

          {mode === "login" && (
            <div className="text-center mt-2">
              <Link href="/forgot-password" className="text-sm underline text-blue-600 hover:text-blue-800">
                {t.forgot_password}
              </Link>
            </div>
          )}

          <p className="text-sm text-center text-gray-500">
            {mode === "login" ? (
              <>
                {t.no_account} {" "}
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setMode("register")}
                >
                  {t.register_action}
                </span>
              </>
            ) : (
              <>
                {t.has_account} {" "}
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => setMode("login")}
                >
                  {t.login_action}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
