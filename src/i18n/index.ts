"use client";

/**
 * Système de traduction FR/EN de tout le site.
 *
 * Les textes vivent dans des dictionnaires où chaque entrée contient sa version française et
 * anglaise côte à côte :
 *
 *   title: { fr: "Mon profil", en: "My profile" },
 *   kids: { fr: (n: number) => `${n} enfants`, en: (n: number) => `${n} children` },
 *   steps: [{ title: { fr: "…", en: "…" } }, …],   // listes : un objet par élément
 *
 * - `site.ts`      : site public (navbar, footer, accueil, pages vitrines, blog, FAQ, contact…)
 * - `auth.ts`      : connexion, inscription, mot de passe oublié / réinitialisation
 * - `dashboard.ts` : espaces au pair & famille
 * - `admin.ts`     : back-office
 * - `values.ts`    : valeurs stockées en base en français (pays, langues…) et erreurs de l'API
 *
 * Dans un composant client : `const { t } = useI18n();` puis `t.home.title` ou `t.common.kids(2)`.
 * TypeScript refuse une entrée à laquelle il manque l'une des deux langues, et deux fichiers
 * qui déclareraient la même section.
 */

import { useMemo } from "react";
import { useLang, type Lang } from "@/contexts/LanguageContext";
import { dashboard } from "./dashboard";
import { site } from "./site";
import { auth } from "./auth";
import { admin } from "./admin";
import { translateServerError, translateValue } from "./values";

export type { Lang };

type Translation = { fr: unknown; en: unknown };

/** Forme attendue d'un dictionnaire : des groupes imbriqués dont les feuilles sont des paires { fr, en } de même type. */
export type Dictionary = {
  [key: string]:
    | { fr: string; en: string }
    | { fr: (...args: never[]) => string; en: (...args: never[]) => string }
    | { fr: readonly string[]; en: readonly string[] }
    | readonly Dictionary[]
    | Dictionary;
};

/** Le dictionnaire "aplati" dans une langue : chaque paire { fr, en } devient sa valeur pour cette langue. */
export type Resolved<T> = T extends { fr: infer F; en: unknown }
  ? F extends string
    ? string
    : F extends readonly string[]
      ? readonly string[]
      : F
  : { [K in keyof T]: Resolved<T[K]> };

// Deux fichiers ne doivent pas déclarer la même section (l'une écraserait l'autre).
type Overlap<A, B> = Extract<keyof A, keyof B>;
type AssertNever<T extends never> = T;
export type _NoDuplicateSections = AssertNever<
  | Overlap<typeof dashboard, typeof site>
  | Overlap<typeof dashboard, typeof auth>
  | Overlap<typeof dashboard, typeof admin>
  | Overlap<typeof site, typeof auth>
  | Overlap<typeof site, typeof admin>
  | Overlap<typeof auth, typeof admin>
>;

const messages = { ...dashboard, ...site, ...auth, ...admin };
export type Messages = Resolved<typeof messages>;

function isTranslation(value: unknown): value is Translation {
  return typeof value === "object" && value !== null && "fr" in value && "en" in value;
}

function resolve<T>(node: T, lang: Lang): Resolved<T> {
  if (isTranslation(node)) return node[lang] as Resolved<T>;
  if (Array.isArray(node)) return node.map((item) => resolve(item, lang)) as Resolved<T>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    out[key] = resolve(value, lang);
  }
  return out as Resolved<T>;
}

const cache = new Map<Lang, Messages>();

export function getDictionary(lang: Lang): Messages {
  let resolved = cache.get(lang);
  if (!resolved) {
    resolved = resolve(messages, lang);
    cache.set(lang, resolved);
  }
  return resolved;
}

/** Locale Intl correspondant à la langue (dates, heures, montants). */
export function intlLocale(lang: Lang): string {
  return lang === "en" ? "en-GB" : "fr-FR";
}

/** "À l'instant", "Il y a 5 min", "Hier"… dans la langue du dictionnaire fourni. */
export function formatRelativeDate(date: Date | string, t: Messages): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t.time.justNow;
  if (diffMin < 60) return t.time.minutesAgo(diffMin);
  if (diffHours < 24) return t.time.hoursAgo(diffHours);
  if (diffDays === 1) return t.time.yesterday;
  return t.time.daysAgo(diffDays);
}

export function useI18n() {
  const { lang, setLang } = useLang();

  return useMemo(() => {
    const t = getDictionary(lang);
    return {
      lang,
      setLang,
      locale: intlLocale(lang),
      /** Textes de l'interface. */
      t,
      /** Date relative ("Il y a 5 min" / "5 min ago"). */
      relativeDate: (date: Date | string) => formatRelativeDate(date, t),
      /** Valeur stockée en base en français (langue, pays, niveau d'études…) → libellé affiché. */
      tValue: (value: string | null | undefined) => translateValue(value, lang),
      /** Liste de valeurs stockées en base → libellés affichés, séparés par des virgules. */
      tList: (values: string[] | null | undefined) =>
        (values ?? []).map((v) => translateValue(v, lang)).join(", "),
      /** Message d'erreur renvoyé par l'API (en français) → message affiché. */
      tError: (message: string | null | undefined, fallback: string) =>
        message ? translateServerError(message, lang) : fallback,
    };
  }, [lang, setLang]);
}
