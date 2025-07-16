"use client";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { useState } from "react";
import ModalAlert from "../../components/ModalAlert";


export default function ContactPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      form.reset();
      setShowModal(true); // показати модалку

      setTimeout(() => {
        setShowModal(false);
        window.location.href = "/";
      }, 2500);
    } else {
      setStatus("error");
    }
  } catch {
    setStatus("error");
  }
}; 

return (
  <>
    <div className="flex justify-center px-4 py-6">
      <div className="relative w-full max-w-sm bg-white border border-blue-200 rounded-xl shadow-lg p-5 mt-16">
  <button
    onClick={() => window.location.href = "/"}
    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold"
    aria-label="Close"
  >
    ×
  </button>
        <h1 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 text-center">
          {t.contact_title}
        </h1>
        <p className="text-sm text-blue-800 mb-4 text-center">
          {t.contact_description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            type="text"
            placeholder={t.contact_name_placeholder}
            className="w-full border border-gray-300 p-2 rounded text-sm"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="example@email.com"
            className="w-full border border-gray-300 p-2 rounded text-sm"
            required
          />
          <textarea
            name="message"
            rows={4}
            placeholder={t.contact_message_placeholder}
            className="w-full border border-gray-300 p-2 rounded text-sm"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-2 rounded text-sm font-semibold hover:bg-blue-900 transition"
          >
            {t.contact_submit}
          </button>

          {status === "success" && (
            <div className="text-blue-800 bg-green-100 border border-green-300 p-3 rounded text-center text-sm">
              {t.contact_success}
            </div>
          )}
          {status === "error" && (
            <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded text-center text-sm">
              {t.contact_error}
            </div>
          )}
        </form>
      </div>
    </div>
{showModal && (
  <ModalAlert
    show={true}
    title={t.attention}
    message={t.contact_success}
    mode={undefined}
    onClose={() => {
      setShowModal(false);
      window.location.href = "/";
       }}
     />
    )}
  </>
);
}

