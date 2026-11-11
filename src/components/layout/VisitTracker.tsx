"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const VISITOR_KEY = "aupair-visitor-id";
/** Dernier envoi : `AAAA-MM-JJ:1` (connecté) ou `AAAA-MM-JJ:0` (anonyme) ; ancien format = date seule */
const LAST_DAY_KEY = "aupair-visit-day";

/**
 * Compte un visiteur unique par jour : identifiant aléatoire gardé dans le navigateur,
 * envoyé au plus une fois par jour, plus une fois s'il se connecte dans la journée (le serveur
 * marque alors la visite « avec compte » d'après la session). Le back-office n'est pas compté.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { status } = useSession();
  const authenticated = status === "authenticated";

  useEffect(() => {
    if (isAdmin || status === "loading") return;
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = localStorage.getItem(LAST_DAY_KEY) ?? "";
      const sentToday = last.startsWith(today);
      const sentWithAccount = last === `${today}:1`;
      if (sentWithAccount || (sentToday && !authenticated)) return;

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
          if (res.ok) localStorage.setItem(LAST_DAY_KEY, `${today}:${authenticated ? 1 : 0}`);
        })
        .catch(() => {});
    } catch {
      // Stockage indisponible (navigation privée, cookies bloqués) : visite non comptée
    }
  }, [isAdmin, status, authenticated]);

  return null;
}
