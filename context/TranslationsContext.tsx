"use client";
import { createContext, useContext } from "react";

// 🔧 Більше не потрібно вкладених мов
export const TranslationsContext = createContext<Record<string, string>>({});

export function TranslationsProvider({
  translations,
  children,
}: {
  translations: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <TranslationsContext.Provider value={translations}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslatedComment(id: string): string | undefined {
  const translations = useContext(TranslationsContext);
  return translations[id];
}
