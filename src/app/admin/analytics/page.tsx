"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Globe2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type AnalyticsData = {
  signupsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  auPairStatus: Record<string, number>;
  familyStatus: Record<string, number>;
  topCountries: { country: string; flag: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  HIDDEN: "Masqué",
  SUSPENDED: "Suspendu",
  DELETED: "Supprimé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-400",
  ACTIVE: "bg-green-500",
  HIDDEN: "bg-gray-400",
  SUSPENDED: "bg-red-400",
  DELETED: "bg-gray-300",
};

function BarChart({ data, valueKey, formatValue }: { data: { month: string; [key: string]: string | number }[]; valueKey: string; formatValue?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey])));
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => {
        const value = Number(d[valueKey]);
        const height = Math.max(4, (value / max) * 100);
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-[#1A1A2E]">{formatValue ? formatValue(value) : value}</span>
            <div className="w-full bg-[#FFF3E0] rounded-t-lg flex-1 flex items-end">
              <div className="w-full bg-[#E87722] rounded-t-lg transition-all" style={{ height: `${height}%` }} />
            </div>
            <span className="text-xs text-gray-400">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusDistribution({ title, counts }: { title: string; counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[#1A1A2E] text-sm">{title}</h3>
        <span className="text-xs text-gray-400">{total} profil(s)</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden bg-gray-100 flex">
        {Object.entries(counts).map(([status, count]) => (
          count > 0 && (
            <div key={status} className={STATUS_COLORS[status]} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} title={`${STATUS_LABELS[status]}: ${count}`} />
          )
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(counts).map(([status, count]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
            {STATUS_LABELS[status]} ({count})
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Analytics</h1>
          <p className="text-gray-500 text-sm">Tendances des 6 derniers mois</p>
        </div>

        {loading || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-[#1A1A2E]">Nouvelles inscriptions</h2>
                </div>
                <BarChart data={data.signupsByMonth} valueKey="count" />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-[#FFF3E0] rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5 text-[#E87722]" />
                  </div>
                  <h2 className="font-bold text-[#1A1A2E]">Revenus (EUR)</h2>
                </div>
                <BarChart data={data.revenueByMonth} valueKey="amount" formatValue={(v) => formatCurrency(v, "EUR")} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
                <h2 className="font-bold text-[#1A1A2E]">Répartition des profils</h2>
                <StatusDistribution title="Au pairs" counts={data.auPairStatus} />
                <StatusDistribution title="Familles" counts={data.familyStatus} />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                    <Globe2 className="w-4.5 h-4.5 text-teal-600" />
                  </div>
                  <h2 className="font-bold text-[#1A1A2E]">Pays d'origine des au pairs</h2>
                </div>
                {data.topCountries.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucune donnée disponible.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topCountries.map((c) => (
                      <div key={c.country} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{c.flag} {c.country}</span>
                        <Badge variant="secondary">{c.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
