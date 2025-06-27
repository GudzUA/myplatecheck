"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => {
        router.push("/");
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [sent, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/request-reset", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": lang,
  },
  body: JSON.stringify({ email }),
});

      const data = await res.json();

      if (data.success) {
        if (data.message === "Email already sent recently") {
          setError(t.reset_already_sent);
        } else if (data.message === "User not found") {
          setError(t.contact_error);
        } else {
          setSent(true);
        }
      } else {
        setError(t.reset_error);
      }
    } catch {
      setError(t.reset_error);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-900">{t.reset_title}</h1>

      {sent ? (
        <div className="text-center bg-green-100 text-green-800 p-4 rounded shadow">
          <p className="font-medium">✅ {t.reset_link_sent}</p>
          <p className="text-sm mt-2">🔄 {t.redirecting || "Перенаправлення..."}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-md mx-auto">
          <label className="block">
            <span className="text-gray-700">{t.contact_email_placeholder}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              placeholder="example@email.com"
              required
              className="mt-1 w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {t.reset_submit}
          </button>
        </form>
      )}
    </main>
  );
}
