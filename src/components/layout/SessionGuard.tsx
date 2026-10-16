"use client";

import { useCallback, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

const PRIVATE_PATHS = ["/dashboard", "/admin"];
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Déconnecte automatiquement l'utilisateur dès que sa session n'est plus valide
 * (expirée, plafond ADMIN atteint, compte désactivé, mot de passe changé ailleurs).
 *
 * Vérifie la session côté serveur au retour sur l'onglet, au retour du réseau et
 * toutes les 5 minutes. Hors ligne ou en cas d'erreur réseau, on ne fait rien :
 * on ne déconnecte que sur une réponse explicite du serveur.
 */
export default function SessionGuard() {
  const { data: session, status, update } = useSession();
  const hadSession = useRef(false);
  const signingOut = useRef(false);

  const forceSignOut = useCallback(() => {
    if (signingOut.current) return;
    signingOut.current = true;
    const { pathname, search } = window.location;
    const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));
    let redirectTo = window.location.href;
    if (isPrivate) {
      const callback = getSafeCallbackUrl(pathname + search);
      redirectTo =
        callback !== "/" ? `/connexion?callbackUrl=${encodeURIComponent(callback)}` : "/connexion";
    }
    signOut({ redirectTo });
  }, []);

  const check = useCallback(async () => {
    if (!hadSession.current || signingOut.current || !navigator.onLine) return;
    let data: { user?: { id?: string } } | null;
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) return;
      data = await res.json();
    } catch {
      return; // réseau indisponible : on réessaiera plus tard
    }
    if (!data?.user?.id) {
      forceSignOut();
    } else if (status !== "authenticated") {
      // La session côté client a pu être perdue pendant une coupure réseau alors
      // qu'elle est toujours valide : on la resynchronise.
      update();
    }
  }, [forceSignOut, status, update]);

  // Session présente côté client mais sans identifiant (ancien cookie invalidé).
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.id) forceSignOut();
  }, [status, session, forceSignOut]);

  // Session perdue (ex. expirée) alors que l'utilisateur était connecté.
  useEffect(() => {
    if (status === "authenticated") hadSession.current = true;
    else if (status === "unauthenticated" && hadSession.current) check();
  }, [status, check]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [check]);

  return null;
}
