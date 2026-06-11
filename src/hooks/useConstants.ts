"use client";

import { useEffect, useState } from "react";
import {
  LANGUAGES,
  EDUCATION_LEVELS,
  DURATIONS,
  REPORT_REASONS,
  SUBSCRIPTION_PRICE_EUR,
  SUBSCRIPTION_PRICE_XOF,
  SUBSCRIPTION_DAYS,
} from "@/lib/constants";

export interface ConstantsDTO {
  languages: string[];
  educationLevels: string[];
  durations: string[];
  reportReasons: string[];
  subscription: { priceEur: number; priceXof: number; days: number };
}

const DEFAULT_CONSTANTS: ConstantsDTO = {
  languages: LANGUAGES,
  educationLevels: EDUCATION_LEVELS,
  durations: DURATIONS,
  reportReasons: REPORT_REASONS,
  subscription: { priceEur: SUBSCRIPTION_PRICE_EUR, priceXof: SUBSCRIPTION_PRICE_XOF, days: SUBSCRIPTION_DAYS },
};

/** Constantes éditables par l'admin (langues, niveaux d'études, durées, motifs de signalement, abonnement). */
export function useConstants(): ConstantsDTO {
  const [data, setData] = useState<ConstantsDTO>(DEFAULT_CONSTANTS);

  useEffect(() => {
    fetch("/api/constants")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json as ConstantsDTO);
      });
  }, []);

  return data;
}
