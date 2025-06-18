"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

export default function ResetPasswordForm() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const params = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const emailFromUrl = params.get("email");
    const tokenFromUrl = params.get("token");

    if (emailFromUrl) setEmail(emailFromUrl.trim().toLowerCase());
    if (tokenFromUrl) setToken(tokenFromUrl);

    if (!emailFromUrl || !tokenFromUrl) {
      setError(t.reset_missing_email);
    }
  }, [params, t]);

  const handleSubmit = async () => {
    setError("");

    if (!password || !confirm) {
      setError(t.fill_all_fields);
      return;
    }

    if (password !== confirm) {
      setError(t.passwords_do_not_match);
      return;
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(t.reset_error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        window.dispatchEvent(new CustomEvent("openLoginModal"));
      }, 2500);
    } catch (err) {
      console.error("❌ Reset error:", err);
      setError(t.reset_error);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">{t.reset_password_title}</h1>

      {success ? (
        <p className="text-green-700 text-center font-medium">{t.reset_success}</p>
      ) : (
        <>
          {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}
          <p className="mb-4 text-sm text-gray-600 text-center">
            {t.reset_for_email} <strong>{email}</strong>
          </p>

          <div className="space-y-4">
            <input
              type="password"
              placeholder={t.password_placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <input
              type="password"
              placeholder={t.confirm_password_placeholder}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900 transition"
            >
              {t.reset_button}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
