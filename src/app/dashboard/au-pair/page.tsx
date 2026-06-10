"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Search,
  MessageCircle,
  Bell,
  CreditCard,
  Settings,
  Home,
  MapPin,
  Clock,
  Eye,
  Heart,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  {
    href: "/dashboard/au-pair/recherche",
    icon: Search,
    label: "Rechercher une famille",
  },
  {
    href: "/dashboard/au-pair/messages",
    icon: MessageCircle,
    label: "Messages",
  },
  {
    href: "/dashboard/au-pair/notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    href: "/dashboard/au-pair/abonnement",
    icon: CreditCard,
    label: "Mon abonnement",
  },
  {
    href: "/dashboard/au-pair/parametres",
    icon: Settings,
    label: "Paramètres",
  },
];

interface SuggestedFamily {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  kids: number;
  hoursPerWeek: number;
  pocketMoney: number;
}

interface DashboardData {
  firstName: string;
  lastName: string;
  profileCompletion: number;
  profileViews: number;
  favoritesCount: number;
  totalMessages: number;
  unreadMessages: number;
  subscription: { active: boolean; daysLeft: number };
  suggestedFamilies: SuggestedFamily[];
}

export default function AuPairDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/au-pair")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const profileCompletion = data?.profileCompletion ?? 0;
  const subscriptionActive = data?.subscription.active ?? false;
  const daysLeft = data?.subscription.daysLeft ?? 0;
  const userName = data ? `${data.firstName} ${data.lastName.charAt(0)}.` : "";

  const stats = [
    { icon: Eye, label: "Vues du profil", value: data?.profileViews ?? 0 },
    { icon: Heart, label: "Mis en favoris", value: data?.favoritesCount ?? 0 },
    {
      icon: MessageCircle,
      label: "Messages reçus",
      value: data?.totalMessages ?? 0,
      trend:
        data && data.unreadMessages > 0
          ? `${data.unreadMessages} non lu${data.unreadMessages > 1 ? "s" : ""}`
          : undefined,
    },
  ];

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName={userName}>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">
            Bonjour, {data?.firstName ?? ""} 👋
          </h1>
          <p className="text-gray-500">
            Voici un résumé de votre activité sur AuPair A.EU
          </p>
        </div>

        {/* Alertes */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Complétion profil */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A1A2E]">
                Complétion du profil
              </h3>
              <span className="text-[#E87722] font-bold text-lg">
                {profileCompletion}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="bg-[#E87722] h-2 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Un profil complet attire 3x plus de familles.
            </p>
            <Link href="/dashboard/au-pair/profil">
              <Button size="sm" variant="outline">
                Compléter mon profil
              </Button>
            </Link>
          </div>

          {/* Abonnement */}
          <div
            className={`rounded-2xl p-5 border shadow-sm ${!subscriptionActive ? "bg-red-50 border-red-200" : daysLeft <= 7 ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A1A2E]">Mon abonnement</h3>
              <Badge
                variant={
                  !subscriptionActive
                    ? "destructive"
                    : daysLeft <= 7
                      ? "warning"
                      : "success"
                }
              >
                {subscriptionActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#E87722]" />
              <span className="font-bold text-2xl text-[#1A1A2E]">
                {daysLeft}
              </span>
              <span className="text-gray-500">jours restants</span>
            </div>
            <Link href="/dashboard/au-pair/abonnement">
              <Button
                size="sm"
                variant={
                  !subscriptionActive || daysLeft <= 7 ? "default" : "outline"
                }
              >
                {subscriptionActive
                  ? daysLeft <= 7
                    ? "Renouveler maintenant"
                    : "Gérer l'abonnement"
                  : "S'abonner"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center"
              >
                <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#E87722]" />
                </div>
                <div className="text-2xl font-extrabold text-[#1A1A2E]">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                {s.trend && (
                  <div className="text-xs text-[#E87722] mt-1 font-medium">
                    {s.trend}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Suggestions familles */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1A2E]">
              Familles suggérées pour vous
            </h3>
            <Link
              href="/dashboard/au-pair/recherche"
              className="text-[#E87722] text-sm font-semibold"
            >
              Voir toutes →
            </Link>
          </div>
          {data && data.suggestedFamilies.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune suggestion pour le moment. Complétez votre profil pour de
              meilleures recommandations.
            </p>
          ) : (
            <div className="space-y-3">
              {(data?.suggestedFamilies ?? []).map((f) => (
                <Link
                  key={f.id}
                  href={`/dashboard/au-pair/famille/${f.id}`}
                  className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#FFF3E0] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">{f.flag}</div>
                    <div>
                      <p className="font-semibold text-[#1A1A2E] text-sm">
                        {f.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {f.city}, {f.country}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#E87722]">
                      {f.pocketMoney}€/mois
                    </p>
                    <p className="text-xs text-gray-400">
                      {f.kids} enfant{f.kids > 1 ? "s" : ""} · {f.hoursPerWeek}
                      h/sem
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
