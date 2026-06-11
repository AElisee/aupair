"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home } from "lucide-react";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

export default function MessagesPage() {
  return (
    <DashboardLayout navItems={navItems} role="au-pair">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A2E] mb-3 sm:mb-6">Messages</h1>
        <Suspense>
          <MessagesPanel />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
