"use client";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { useState } from "react";

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t.contact_title}</h1>
      <p className="text-gray-700 mb-6 text-center">{t.contact_description}</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1">{t.contact_name}</label>
          <input
            name="name"
            type="text"
            placeholder={t.contact_name_placeholder}
            className="w-full border border-gray-300 p-3 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">{t.contact_email}</label>
          <input
            name="email"
            type="email"
            placeholder={t.contact_email_placeholder}
            className="w-full border border-gray-300 p-3 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">{t.contact_message}</label>
          <textarea
            name="message"
            rows={5}
            placeholder={t.contact_message_placeholder}
            className="w-full border border-gray-300 p-3 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {t.contact_submit}
        </button>

        {status === "success" && (
          <div className="text-green-700 bg-green-100 border border-green-300 p-3 rounded text-center mt-3">
            {t.contact_success}
          </div>
        )}
        {status === "error" && (
          <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded text-center mt-3">
            {t.contact_error}
          </div>
        )}
      </form>
    </main>
  );
}
