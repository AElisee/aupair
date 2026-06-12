"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { Home, User, Search, Heart, MessageCircle, Bell, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/favoris", icon: Heart, label: "Mes favoris" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

export default function FamilleNotificationsPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} role="famille" userName={session?.user?.name ?? ""}>
      <NotificationsPanel />
    </DashboardLayout>
  );
}
