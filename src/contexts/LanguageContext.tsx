"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from "react";

export type Lang = "fr" | "en";

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

const STORAGE_KEY = "aupair-lang";

// Langue choisie pendant la session : prend le relais si le localStorage est inaccessible (navigation privée…).
let sessionLang: Lang | null = null;
const listeners = new Set<() => void>();

function readLang(): Lang {
  if (sessionLang) return sessionLang;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

function subscribe(onChange: () => void) {
  // Synchronise les autres onglets : la valeur du localStorage redevient la référence.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    sessionLang = null;
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Le serveur rend toujours en français ; côté client, React bascule sur la langue enregistrée
 * juste après l'hydratation (useSyncExternalStore évite ainsi toute erreur d'hydratation).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore<Lang>(subscribe, readLang, () => "fr");

  const setLang = useCallback((l: Lang) => {
    sessionLang = l;
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // stockage indisponible : la langue reste valable pour la session
    }
    listeners.forEach((notify) => notify());
  }, []);

  const t = useCallback((fr: string, en: string) => (lang === "en" ? en : fr), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
