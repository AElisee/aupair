"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";
import { User, Search, MessageCircle, Bell, Settings, Home, Heart } from "lucide-react";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/favoris", icon: Heart, label: "Mes favoris" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

export default function MessagesPage() {
  return (
    <DashboardLayout navItems={navItems} role="famille">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] mb-3 sm:mb-6">Messages</h1>
        <Suspense>
          <MessagesPanel />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
