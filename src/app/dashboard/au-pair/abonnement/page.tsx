"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home, CheckCircle, Clock, Smartphone, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

export default function AbonnementPage() {
  const currentSub = { status: "ACTIVE", expiresAt: "2026-04-07", daysLeft: 18, amount: 32, currency: "EUR" };

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName="Aminata K.">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Mon abonnement</h1>

        {/* Statut actuel */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1A1A2E]">Abonnement actuel</h2>
            <Badge variant="success">Actif</Badge>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#FFF3E0] rounded-full flex items-center justify-center">
              <Clock className="w-7 h-7 text-[#E87722]" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#1A1A2E]">{currentSub.daysLeft} jours</p>
              <p className="text-sm text-gray-500">restants · Expire le {formatDate(currentSub.expiresAt)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#E87722] h-2 rounded-full" style={{ width: `${(currentSub.daysLeft / 30) * 100}%` }} />
          </div>
        </div>

        {/* Renouveler */}
        <div className="bg-gradient-to-br from-[#E87722] to-[#ff9a3c] rounded-2xl p-6 text-white">
          <h2 className="font-bold text-xl mb-1">Renouveler mon abonnement</h2>
          <p className="text-white/80 mb-4 text-sm">Restez visible par toutes les familles d'accueil.</p>
          <div className="bg-white/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Abonnement 30 jours</span>
              <span className="font-extrabold text-xl">32€</span>
            </div>
            <p className="text-white/70 text-xs mt-1">= 20 800 FCFA · Accès complet à toutes les fonctionnalités</p>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium transition-colors">
              <Smartphone className="w-4 h-4" />
              Payer par Mobile Money (20 800 FCFA)
            </button>
            <button className="w-full flex items-center gap-3 bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium transition-colors">
              <CreditCard className="w-4 h-4" />
              Payer par carte bancaire (32€)
            </button>
            <button className="w-full flex items-center gap-3 bg-white/20 hover:bg-white/30 rounded-xl p-3 text-sm font-medium transition-colors">
              <Globe className="w-4 h-4" />
              Payer par PayPal (32€)
            </button>
          </div>
        </div>

        {/* Inclus dans l'abonnement */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Inclus dans votre abonnement</h2>
          <div className="space-y-3">
            {[
              "Profil visible par toutes les familles d'accueil",
              "Messagerie illimitée avec les familles",
              "Accès aux coordonnées des familles",
              "Système de favoris",
              "Notifications de nouveaux profils correspondants",
              "Support prioritaire",
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
