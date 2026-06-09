"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Users, DollarSign, Shield, AlertTriangle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const kpis = [
  { icon: Users, label: "Utilisateurs totaux", value: "6 234", change: "+124 ce mois", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: UserPlus, label: "Inscriptions (30j)", value: "342", change: "+18% vs mois dernier", color: "text-green-600", bg: "bg-green-50" },
  { icon: DollarSign, label: "Revenus (30j)", value: "8 960€", change: "+280 abonnements actifs", color: "text-[#E87722]", bg: "bg-[#FFF3E0]" },
  { icon: Shield, label: "Profils en attente", value: "23", change: "À valider", color: "text-red-600", bg: "bg-red-50" },
];

const recentUsers = [
  { id: "1", name: "Aminata K.", role: "AU_PAIR", country: "🇨🇲 Cameroun", status: "PENDING", date: "Il y a 2h" },
  { id: "2", name: "Famille Dubois", role: "FAMILLE", country: "🇫🇷 France", status: "ACTIVE", date: "Il y a 4h" },
  { id: "3", name: "Kofi M.", role: "AU_PAIR", country: "🇬🇭 Ghana", status: "PENDING", date: "Il y a 6h" },
  { id: "4", name: "Famille Weber", role: "FAMILLE", country: "🇩🇪 Allemagne", status: "ACTIVE", date: "Hier" },
  { id: "5", name: "Fatou S.", role: "AU_PAIR", country: "🇸🇳 Sénégal", status: "PENDING", date: "Hier" },
];

const recentPayments = [
  { id: "1", user: "Aminata K.", amount: "32€", method: "Mobile Money", status: "ACTIVE", date: "Il y a 1h" },
  { id: "2", user: "Kofi M.", amount: "20 800 FCFA", method: "Mobile Money", status: "ACTIVE", date: "Il y a 3h" },
  { id: "3", user: "Ibrahim D.", amount: "32€", method: "Stripe", status: "ACTIVE", date: "Hier" },
];

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Vue d'ensemble de la plateforme AuPair A.EU</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-extrabold text-[#1A1A2E]">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                <p className={`text-xs font-medium mt-1 ${kpi.color}`}>{kpi.change}</p>
              </div>
            );
          })}
        </div>

        {/* Alerte modération */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">23 profils en attente de validation</p>
            <p className="text-xs text-amber-600">Validez les profils pour les rendre visibles sur la plateforme.</p>
          </div>
          <Link href="/admin/moderation">
            <button className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
              Modérer
            </button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Derniers utilisateurs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-bold text-[#1A1A2E]">Derniers inscrits</h2>
              <Link href="/admin/utilisateurs" className="text-[#E87722] text-xs font-semibold">Voir tous →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.country} · {u.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "AU_PAIR" ? "default" : "secondary"} className="text-xs">
                      {u.role === "AU_PAIR" ? "Au pair" : "Famille"}
                    </Badge>
                    <Badge variant={u.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
                      {u.status === "ACTIVE" ? "Actif" : "En attente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers paiements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-bold text-[#1A1A2E]">Derniers paiements</h2>
              <Link href="/admin/paiements" className="text-[#E87722] text-xs font-semibold">Voir tous →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{p.user}</p>
                    <p className="text-xs text-gray-400">{p.method} · {p.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#E87722]">{p.amount}</span>
                    <Badge variant="success" className="text-xs">Payé</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
