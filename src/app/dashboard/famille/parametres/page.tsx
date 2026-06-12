"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import {
  Home,
  User,
  Search,
  Heart,
  MessageCircle,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/favoris", icon: Heart, label: "Mes favoris" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

export default function FamilleParametresPage() {
  const { data: session } = useSession();

  return (
    <DashboardLayout navItems={navItems} role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres</h1>
        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  );
}
