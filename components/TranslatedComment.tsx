"use client";
import { useContext } from "react";
import { TranslationsContext } from "@/context/TranslationsContext";

export default function TranslatedComment({
  id,
  originalText,
}: {
  id: string;
  originalText: string;
}) {
  const translations = useContext(TranslationsContext);
  const translated = translations[id]; // ✅ тут вже без lang, бо передається translationsMap[lang]

  return <>{translated || originalText}</>;
}
