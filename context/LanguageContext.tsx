"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Lang = "UA" | "EN" | "FR";

interface LanguageContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: "UA",
  setLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("UA");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    const upper = saved?.toUpperCase();
    if (upper === "UA" || upper === "EN" || upper === "FR") {
      setLang(upper);
    }
  }, []);

  const changeLang = (newLang: Lang) => {
    localStorage.setItem("lang", newLang);
    setLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
