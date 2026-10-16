"use client";
import { useSyncExternalStore } from "react";

/** Soirée = de 18h à 4h59, selon l'heure de l'appareil */
const isEveningNow = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 5;
};

const subscribe = (onChange: () => void) => {
  const interval = setInterval(onChange, 60_000);
  return () => clearInterval(interval);
};

/** `true` le soir sur l'appareil du visiteur ; le rendu serveur suppose la journée (pas d'écart d'hydratation) */
export function useIsEvening() {
  return useSyncExternalStore(subscribe, isEveningNow, () => false);
}
