"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import Link from "next/link";
import { assignBadges } from "../utils/badges";


type User = {
  email: string;
  login: string;
  plate: string;
  password: string;
  type: string;
  usedInitialLimit?: boolean;
};

export default function LoginRegisterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [plate, setPlate] = useState("");
  const { lang } = useLanguage();
  const t = translations[lang];
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

 const handleLogin = () => {
  const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");
  const emailClean = email.trim().toLowerCase();

  const found = users.find(
    (u) => u.email === emailClean && u.password === password
  );

if (found) {
  // 🔍 Перевіряємо чи PRO не закінчився
  const updatedUser = { ...found };

if (updatedUser.pro && updatedUser.proUntil) {
  const isExpired = new Date(updatedUser.proUntil) < new Date();
  if (isExpired) {
    updatedUser.pro = false;
    updatedUser.type = "registered";
    delete updatedUser.proUntil;
    delete updatedUser.tariff;
  }
}
  // 💾 Зберігаємо
  // 🏷 Додаємо значки
  const updatedUserWithBadges = {
    ...updatedUser,
    badges: assignBadges(updatedUser),
  };

  localStorage.setItem("user", JSON.stringify(updatedUserWithBadges));

  const updatedUsers = users.map((u) =>
    u.email === updatedUserWithBadges.email ? updatedUserWithBadges : u
  );
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  window.dispatchEvent(new Event("userUpdated"));
  window.location.reload();

} else {
    alert(t.wrong_email_or_password);
  }
};

  const handleRegister = () => {
  if (!email || !login || !plate || !password || !confirm) {
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

  const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.some((u) => u.email === emailClean)) {
    alert(t.email_exists);
    return;
  }

  const loginKey = login.toLowerCase();

    const newUser: User = {
    email: emailClean,
    login: loginKey,
    plate,
    password,
    type: "registered",
  };

  const newUserWithBadges = {
    ...newUser,
    badges: assignBadges(newUser),
  };

  localStorage.setItem("users", JSON.stringify([...users, newUserWithBadges]));
  localStorage.setItem("user", JSON.stringify(newUserWithBadges));

  window.dispatchEvent(new Event("userUpdated"));
  window.location.reload();

};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
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
    const allowed = /^[a-zA-Z0-9@._\-+]*$/; // лише англ. символи, @, крапка, тире, підкреслення
    if (allowed.test(val)) {
      setEmail(val.trim().toLowerCase());
    }
  }}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder={t.login_placeholder_short}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder={t.plate_placeholder}
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <input
            type="password"
            placeholder={t.password_placeholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {mode === "register" && (
            <input
              type="password"
              placeholder={t.confirm_password_placeholder}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <button
            onClick={mode === "login" ? handleLogin : handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
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
      {t.no_account}{" "}
      <span
        className="text-blue-600 hover:underline cursor-pointer"
        onClick={() => setMode("register")}
      >
        {t.register_action}
      </span>
    </>
  ) : (
    <>
      {t.has_account}{" "}
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