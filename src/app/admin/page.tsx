"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Users, UserCheck, Home, Wallet, CreditCard, Shield, AlertTriangle, Loader2, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useI18n } from "@/i18n";

type DashboardData = {
  kpis: {
    totalUsers: number;
    totalAuPairs: number;
    totalFamilies: number;
    signups30d: number;
    signupsChangePct: number;
    revenue30d: string;
    totalRevenue: string;
    activeSubscriptions: number;
    pendingProfiles: number;
    openReports: number;
  };
  recentUsers: {
    id: string;
    name: string;
    role: "AU_PAIR" | "FAMILLE";
    country: string;
    status: string;
    date: string;
    photoUrl: string;
  }[];
  recentPayments: {
    id: string;
    user: string;
    amount: string;
    method: string;
    status: string;
    date: string;
  }[];
};

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, relativeDate } = useI18n();
  const c = t.adminCommon;
  const d = t.adminDashboard;

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AdminLayout>
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">{c.loading}</p>
        </div>
      </AdminLayout>
    );
  }

  const { kpis, recentUsers, recentPayments } = data;

  const signupsChange = `${kpis.signupsChangePct >= 0 ? "+" : ""}${kpis.signupsChangePct}%`;

  const kpiCards = [
    { icon: Users, label: d.totalUsers, value: String(kpis.totalUsers), change: d.signupsThisMonth(kpis.signups30d, signupsChange), color: "text-blue-600", bg: "bg-blue-50" },
    { icon: UserCheck, label: d.auPairs, value: String(kpis.totalAuPairs), change: d.auPairProfiles, color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Home, label: d.families, value: String(kpis.totalFamilies), change: d.familyProfiles, color: "text-teal-600", bg: "bg-teal-50" },
    { icon: Shield, label: d.pendingProfiles, value: String(kpis.pendingProfiles), change: d.toValidate, color: "text-red-600", bg: "bg-red-50" },
    { icon: CreditCard, label: d.activeSubscriptions, value: String(kpis.activeSubscriptions), change: d.over30Days(kpis.revenue30d), color: "text-indigo-600", bg: "bg-indigo-50" },
    { icon: Wallet, label: d.totalRevenue, value: kpis.totalRevenue, change: d.thisMonth(kpis.revenue30d), color: "text-[#E87722]", bg: "bg-[#FFF3E0]" },
    { icon: Flag, label: d.openReports, value: String(kpis.openReports), change: d.toHandle, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{d.title}</h1>
          <p className="text-gray-500 text-sm">{d.subtitle}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
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
        {kpis.pendingProfiles > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">{d.pendingAlert(kpis.pendingProfiles)}</p>
              <p className="text-xs text-amber-600">{d.pendingAlertText}</p>
            </div>
            <Link href="/admin/moderation">
              <button className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                {d.moderate}
              </button>
            </Link>
          </div>
        )}

        {/* Alerte signalements */}
        {kpis.openReports > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <Flag className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">{d.reportsAlert(kpis.openReports)}</p>
              <p className="text-xs text-red-600">{d.reportsAlertText}</p>
            </div>
            <Link href="/admin/moderation">
              <button className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                {c.see}
              </button>
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Derniers utilisateurs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-bold text-[#1A1A2E]">{d.latestSignups}</h2>
              <Link href="/admin/utilisateurs" className="text-[#E87722] text-xs font-semibold">{c.seeAll}</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">{d.noRecentSignups}</p>
              ) : recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {u.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.photoUrl} alt="" className="w-full h-full object-cover object-top" />
                      ) : (
                        (u.name || "?").charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">{u.name || (u.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily)}</p>
                      <p className="text-xs text-gray-400">{u.country} · {relativeDate(u.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "AU_PAIR" ? "default" : "secondary"} className="text-xs">
                      {u.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}
                    </Badge>
                    <Badge variant={u.status === "ACTIVE" ? "success" : "warning"} className="text-xs">
                      {u.status === "ACTIVE" ? c.profileStatus.ACTIVE : c.profileStatus.PENDING}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers paiements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-bold text-[#1A1A2E]">{d.latestPayments}</h2>
              <Link href="/admin/paiements" className="text-[#E87722] text-xs font-semibold">{c.seeAll}</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPayments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">{d.noRecentPayments}</p>
              ) : recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A2E]">{p.user || c.unknownUser}</p>
                    <p className="text-xs text-gray-400">{t.adminPayments.methods[p.method as keyof typeof t.adminPayments.methods] ?? p.method} · {relativeDate(p.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#E87722]">{p.amount}</span>
                    <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"} className="text-xs">
                      {p.status === "ACTIVE" ? d.paid : (t.adminPayments.statuses[p.status as keyof typeof t.adminPayments.statuses] ?? p.status)}
                    </Badge>
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
