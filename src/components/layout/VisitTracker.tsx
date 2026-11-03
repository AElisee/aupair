"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "aupair-visitor-id";
const LAST_DAY_KEY = "aupair-visit-day";

/**
 * Compte un visiteur unique par jour : identifiant aléatoire gardé dans le navigateur,
 * envoyé au plus une fois par jour. Le back-office n'est pas compté.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(LAST_DAY_KEY) === today) return;
      let visitorId = localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
      }
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
        keepalive: true,
      })
        .then((res) => {
          if (res.ok) localStorage.setItem(LAST_DAY_KEY, today);
        })
        .catch(() => {});
    } catch {
      // Stockage indisponible (navigation privée, cookies bloqués) : visite non comptée
    }
  }, [isAdmin]);

  return null;
}
