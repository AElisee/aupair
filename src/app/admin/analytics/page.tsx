"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingUp, Users, Globe2, Home } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type AnalyticsData = {
  signupsByMonth: { month: string; auPair: number; famille: number }[];
  revenueByMonth: { month: string; amount: number }[];
  auPairStatus: Record<string, number>;
  familyStatus: Record<string, number>;
  topCountries: { country: string; flag: string; count: number }[];
  topFamilyCountries: { country: string; flag: string; count: number }[];
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

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const RADIAN = Math.PI / 180;

function renderPieLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: PieLabelRenderProps) {
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.6;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const signupsConfig: ChartConfig = {
  auPair: { label: "Au pairs", color: "var(--chart-1)" },
  famille: { label: "Familles", color: "var(--chart-3)" },
};

const revenueConfig: ChartConfig = {
  amount: { label: "Revenus", color: "var(--chart-1)" },
};

function useCountryChartConfig(countries: { country: string; flag: string }[]) {
  return useMemo(() => {
    const cfg: ChartConfig = {};
    countries.forEach((c) => {
      cfg[c.country] = { label: `${c.flag} ${c.country}` };
    });
    return cfg;
  }, [countries]);
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

  const originConfig = useCountryChartConfig(data?.topCountries ?? []);

  const familyTotal = useMemo(
    () => (data?.topFamilyCountries ?? []).reduce((sum, c) => sum + c.count, 0),
    [data]
  );

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
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Nouvelles inscriptions — area chart interactif, 2 courbes */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A2E]">Nouvelles inscriptions</h2>
                  <p className="text-xs text-gray-400">Au pairs vs familles, par mois</p>
                </div>
              </div>
              <ChartContainer config={signupsConfig} className="aspect-auto h-[260px] w-full">
                <AreaChart data={data.signupsByMonth} margin={{ left: 12, right: 12, top: 12 }}>
                  <defs>
                    <linearGradient id="fillAuPair" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-auPair)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-auPair)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillFamille" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-famille)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-famille)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                  <ChartTooltip cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="famille"
                    type="monotone"
                    fill="url(#fillFamille)"
                    stroke="var(--color-famille)"
                    strokeWidth={2}
                    stackId="signups"
                  />
                  <Area
                    dataKey="auPair"
                    type="monotone"
                    fill="url(#fillAuPair)"
                    stroke="var(--color-auPair)"
                    strokeWidth={2}
                    stackId="signups"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Revenus — line chart interactif */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-[#FFF3E0] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-[#E87722]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A2E]">Revenus</h2>
                  <p className="text-xs text-gray-400">Abonnements encaissés, par mois</p>
                </div>
              </div>
              <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
                <LineChart data={data.revenueByMonth} margin={{ left: 12, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                  <ChartTooltip
                    cursor={{ stroke: "var(--color-amount)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-muted-foreground">Revenus</span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {formatCurrency(Number(value), "EUR")}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Line
                    dataKey="amount"
                    type="monotone"
                    stroke="var(--color-amount)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-amount)", r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            {/* Pays d'origine des au pairs — pie chart avec labels */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Globe2 className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A2E]">Pays d&apos;origine des au pairs</h2>
                  <p className="text-xs text-gray-400">Top 5 des pays d&apos;origine</p>
                </div>
              </div>
              {data.topCountries.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune donnée disponible.</p>
              ) : (
                <ChartContainer config={originConfig} className="mx-auto aspect-square max-h-[280px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="country" hideLabel />} />
                    <Pie
                      data={data.topCountries}
                      dataKey="count"
                      nameKey="country"
                      label={renderPieLabel}
                      labelLine={false}
                    >
                      {data.topCountries.map((entry, index) => (
                        <Cell key={entry.country} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="country" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </div>

            {/* Pays des familles — pie chart avec légende à séparateurs */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Home className="w-4.5 h-4.5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-[#1A1A2E]">Pays des familles</h2>
                  <p className="text-xs text-gray-400">Top 5 des pays d&apos;accueil</p>
                </div>
              </div>
              {data.topFamilyCountries.length === 0 ? (
                <p className="text-gray-400 text-sm">Aucune donnée disponible.</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ChartContainer config={{}} className="mx-auto aspect-square max-h-[220px] sm:max-h-[240px] sm:w-1/2">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="country" hideLabel />} />
                      <Pie data={data.topFamilyCountries} dataKey="count" nameKey="country" innerRadius={55} outerRadius={85} strokeWidth={2}>
                        {data.topFamilyCountries.map((entry, index) => (
                          <Cell key={entry.country} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="var(--color-background)" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="flex-1 w-full">
                    {data.topFamilyCountries.map((c, index) => (
                      <div key={c.country}>
                        {index > 0 && <Separator className="my-2" />}
                        <div className="flex items-center justify-between gap-2 py-0.5">
                          <span className="flex items-center gap-2 text-sm text-gray-700">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            {c.flag} {c.country}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {familyTotal > 0 ? Math.round((c.count / familyTotal) * 100) : 0}%
                            </span>
                            <Badge variant="secondary">{c.count}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Répartition des profils */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5 lg:col-span-2">
              <h2 className="font-bold text-[#1A1A2E]">Répartition des profils</h2>
              <StatusDistribution title="Au pairs" counts={data.auPairStatus} />
              <StatusDistribution title="Familles" counts={data.familyStatus} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
