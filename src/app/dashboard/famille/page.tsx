"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, Settings, Home, Eye, Heart } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

const suggestedAuPairs = [
  { id: "1", firstName: "Aminata", age: 23, country: "Cameroun", flag: "🇨🇲", languages: ["Français", "Anglais"], experience: 3 },
  { id: "2", firstName: "Fatou", age: 22, country: "Sénégal", flag: "🇸🇳", languages: ["Français"], experience: 1 },
  { id: "3", firstName: "Samuel", age: 26, country: "Madagascar", flag: "🇲🇬", languages: ["Français"], experience: 3 },
];

export default function FamilleDashboard() {
  const stats = [
    { icon: Eye, label: "Vues du profil", value: "47", trend: "+8 cette semaine" },
    { icon: MessageCircle, label: "Candidatures reçues", value: "12", trend: "3 non lues" },
    { icon: Heart, label: "Au pairs favoris", value: "6", trend: "+2 cette semaine" },
  ];

  return (
    <DashboardLayout navItems={navItems} role="famille" userName="Famille Martin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Bonjour, Famille Martin 👋</h1>
          <p className="text-gray-500">Voici un résumé de votre activité sur AuPair A.EU</p>
        </div>

        {/* Alerte profil incomplet */}
        <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#1A1A2E] mb-1">Complétez votre profil famille</p>
            <p className="text-sm text-gray-500 mb-3">Un profil complet avec photo et description attire 5x plus d'au pairs qualifiés.</p>
            <Link href="/dashboard/famille/profil">
              <Button size="sm">Compléter mon profil</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#E87722]" />
                </div>
                <div className="text-2xl font-extrabold text-[#1A1A2E]">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                <div className="text-xs text-[#E87722] mt-1 font-medium">{s.trend}</div>
              </div>
            );
          })}
        </div>

        {/* Au pairs suggérés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1A2E]">Au pairs suggérés pour vous</h3>
            <Link href="/dashboard/famille/recherche" className="text-[#E87722] text-sm font-semibold">Voir tous →</Link>
          </div>
          <div className="space-y-3">
            {suggestedAuPairs.map((ap) => (
              <div key={ap.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFF3E0] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {ap.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E] text-sm">{ap.firstName}, {ap.age} ans</p>
                    <p className="text-xs text-gray-500">{ap.flag} {ap.country} · {ap.languages.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{ap.experience} ans exp.</Badge>
                  <Button size="sm" variant="outline">Voir profil</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
