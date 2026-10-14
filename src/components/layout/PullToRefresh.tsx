"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n";

// Distance (px) à tirer pour déclencher l'actualisation, et déplacement max de l'indicateur.
const THRESHOLD = 80;
const MAX_PULL = 120;
// Le doigt bouge plus que l'indicateur, pour un effet de résistance.
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
 * pour supprimer le rebond, ce composant le remplace.
 */
export default function PullToRefresh() {
  const { t } = useI18n();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    const reset = () => {
      startY.current = null;
      pullRef.current = 0;
      setPull(0);
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
      const next = Math.min(delta * RESISTANCE, MAX_PULL);
      pullRef.current = next;
      setPull(next);
    };

    const onTouchEnd = () => {
      if (startY.current === null) return;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(THRESHOLD);
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

  if (pull === 0 && !refreshing) return null;

  const ready = pull >= THRESHOLD;
  const label = refreshing ? t.common.refreshing : ready ? t.common.releaseToRefresh : t.common.pullToRefresh;

  return (
    <div
      className="fixed left-1/2 top-0 z-[200] flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-[#1A1A2E] shadow-lg"
      style={{
        transform: `translate(-50%, ${pull - 48}px)`,
        opacity: Math.min(pull / THRESHOLD, 1),
      }}
      role="status"
      aria-live="polite"
    >
      <RefreshCw
        className={`h-4 w-4 text-[#E87722] ${refreshing ? "animate-spin" : ""}`}
        style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)` }}
      />
      {label}
    </div>
  );
}
