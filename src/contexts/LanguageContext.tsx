"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "fr" | "en";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (fr: string, en: string) => string;
}

const LanguageContext = createContext<LangContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (fr) => fr,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";

    const saved = window.localStorage.getItem("aupair-lang");
    return saved === "fr" || saved === "en" ? saved : "fr";
  });

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem("aupair-lang", l);
  }

  function t(fr: string, en: string) {
    return lang === "en" ? en : fr;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
