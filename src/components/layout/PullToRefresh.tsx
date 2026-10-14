"use client";

import { useEffect, useRef } from "react";

// Distance (px) à tirer pour déclencher l'actualisation.
const THRESHOLD = 80;
const MAX_PULL = 120;
// Le doigt bouge plus que la distance comptée, pour un effet de résistance.
const RESISTANCE = 0.5;

/** Vrai si la cible du toucher est dans un conteneur déjà défilé vers le bas (liste de messages, modale…). */
function isInsideScrolledContainer(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body) {
    if (el.scrollTop > 0) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Pull-to-refresh sur mobile : tirer la page vers le bas depuis le haut recharge la page.
 * Le pull-to-refresh natif est désactivé (`overscroll-behavior-y: none` dans globals.css)
 * pour supprimer le rebond, ce composant le remplace (sans indicateur visuel).
 */
export default function PullToRefresh() {
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const reset = () => {
      startY.current = null;
      pullRef.current = 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || window.scrollY > 0) return;
      // Une modale Radix ouverte verrouille le scroll du body.
      if (document.body.hasAttribute("data-scroll-locked")) return;
      if (isInsideScrolledContainer(e.target)) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta <= 0 || window.scrollY > 0) {
        if (pullRef.current > 0) reset();
        return;
      }
      if (e.cancelable) e.preventDefault();
      pullRef.current = Math.min(delta * RESISTANCE, MAX_PULL);
    };

    const onTouchEnd = () => {
      if (startY.current === null) return;
      if (pullRef.current >= THRESHOLD) {
        window.location.reload();
        return;
      }
      reset();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    // Non passif pour pouvoir bloquer le défilement pendant le geste.
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", reset);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", reset);
    };
  }, []);

  return null;
}
