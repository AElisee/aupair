"use client";
import { useEffect, useSyncExternalStore } from "react";
import type { AdminPermission } from "@/lib/admin-permissions";

type AdminMe = { id: string; name: string; permissions: AdminPermission[] };

/**
 * Store module des permissions de l'admin connecté. Les pages admin rendent elles-mêmes
 * `AdminLayout` (pas de layout.tsx) : un Context posé dans le layout ne serait pas visible
 * depuis le corps de la page, d'où ce store partagé. Le cache évite aussi un écran de
 * chargement à chaque navigation.
 */
let current: AdminMe | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setCurrent(me: AdminMe) {
  current = me;
  listeners.forEach((l) => l());
}

export function useAdminMe() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/** Appelé par AdminLayout : revalide les permissions à chaque page */
export function useLoadAdminMe(pathname: string) {
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AdminMe | null) => {
        if (!cancelled && data) setCurrent(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);
  return useAdminMe();
}

/** Dans une page admin : `const can = useAdminCan(); can("payments.export")` (false tant qu'inconnu) */
export function useAdminCan() {
  const me = useAdminMe();
  return (permission: AdminPermission) => me?.permissions.includes(permission) ?? false;
}
