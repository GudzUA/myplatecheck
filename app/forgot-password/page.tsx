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
  const router = useRouter();

useEffect(() => {
  if (sent) {
    const timeout = setTimeout(() => {
      router.push("/");
    }, 2000);
    return () => clearTimeout(timeout); // очищення
  }
}, [sent, router]);
const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(t.reset_error);
      }
    } catch {
      setError(t.reset_error);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">{t.reset_title}</h1>

      {sent ? (
        <p className="text-green-700 text-center">{t.reset_success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            placeholder={t.contact_email_placeholder}
            required
            className="w-full border border-gray-300 p-3 rounded"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 transition">
            {t.reset_submit}
          </button>
        </form>
      )}
    </main>
  );
}
