"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import {
  Home,
  User,
  Search,
  MessageCircle,
  Bell,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

export default function AuPairNotificationsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName={session?.user?.name ?? ""}>
      <NotificationsPanel />
    </DashboardLayout>
  );
}
