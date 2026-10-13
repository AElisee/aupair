import { Bell, CreditCard, Heart, Home, MessageCircle, Search, Settings, User } from "lucide-react";
import type { dashboard } from "@/i18n/dashboard";

export type DashboardRole = "au-pair" | "famille";

export interface DashboardNavItem {
  href: string;
  icon: React.ElementType;
  /** Clé du libellé dans la section `nav` de `src/i18n/dashboard.ts`. */
  labelKey: keyof typeof dashboard.nav;
}

/** Menu latéral de chaque espace — un seul endroit à modifier pour ajouter/retirer une entrée. */
export const DASHBOARD_NAV: Record<DashboardRole, DashboardNavItem[]> = {
  "au-pair": [
    { href: "/dashboard/au-pair", icon: Home, labelKey: "dashboard" },
    { href: "/dashboard/au-pair/profil", icon: User, labelKey: "profile" },
    { href: "/dashboard/au-pair/recherche", icon: Search, labelKey: "searchFamily" },
    { href: "/dashboard/au-pair/messages", icon: MessageCircle, labelKey: "messages" },
    { href: "/dashboard/au-pair/notifications", icon: Bell, labelKey: "notifications" },
    { href: "/dashboard/au-pair/abonnement", icon: CreditCard, labelKey: "subscription" },
    { href: "/dashboard/au-pair/parametres", icon: Settings, labelKey: "settings" },
  ],
  famille: [
    { href: "/dashboard/famille", icon: Home, labelKey: "dashboard" },
    { href: "/dashboard/famille/profil", icon: User, labelKey: "profile" },
    { href: "/dashboard/famille/recherche", icon: Search, labelKey: "searchAuPair" },
    { href: "/dashboard/famille/favoris", icon: Heart, labelKey: "favorites" },
    { href: "/dashboard/famille/messages", icon: MessageCircle, labelKey: "messages" },
    { href: "/dashboard/famille/notifications", icon: Bell, labelKey: "notifications" },
    { href: "/dashboard/famille/parametres", icon: Settings, labelKey: "settings" },
  ],
};
