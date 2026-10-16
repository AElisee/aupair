"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserRound,
  House,
  CreditCard,
  Hourglass,
  ShieldCheck,
  Flag,
  Loader2,
  UserPlus,
  BadgeCheck,
  Globe2,
  Wallet,
  Receipt,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { BLUE, GREEN, ICON, INDIGO, NAVY, ORANGE, PAGE_TITLE, TEAL, IconChip, KpiGrid, Panel, PanelHeader, pct } from "@/components/admin/AdminUI";

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

type AnalyticsData = {
  signupsByMonth: { month: string; auPair: number; famille: number }[];
  revenueByMonth: { month: string; amount: number }[];
  auPairStatus: Record<string, number>;
  familyStatus: Record<string, number>;
  topCountries: { country: string; flag: string; count: number }[];
  topFamilyCountries: { country: string; flag: string; count: number }[];
};

const SERIES = [ORANGE, BLUE, GREEN];

function Segmented<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex p-0.5 rounded-md bg-gray-100/80 border border-gray-200/60">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`h-6 px-2.5 rounded text-xs transition-colors ${
            value === o.value ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-500 hover:text-[#1A1A2E]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countryTab, setCountryTab] = useState<"auPair" | "famille">("auPair");
  const { t, tValue, relativeDate, locale } = useI18n();
  const c = t.adminCommon;
  const d = t.adminDashboard;
  const ta = t.adminAnalytics;

  useEffect(() => {
    const load = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null));
    Promise.all([load("/api/admin/dashboard"), load("/api/admin/analytics")])
      .then(([dash, stats]) => {
        setData(dash);
        setAnalytics(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data || !analytics) {
    return (
      <AdminLayout>
        <Panel className="p-12 text-center">
          <Loader2 className="mx-auto mb-3 animate-spin text-[#E87722]" {...ICON} />
          <p className="text-sm text-gray-500">{c.loading}</p>
        </Panel>
      </AdminLayout>
    );
  }

  const { kpis, recentUsers, recentPayments } = data;

  // Mois reçus au format AAAA-MM → "févr." / "Feb" selon la langue
  const formatMonth = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(year, month - 1, 1));
  };
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });

  const kpiCards = [
    { icon: Users, value: kpis.totalUsers, label: d.users, caption: d.newThisMonth(kpis.signups30d), ratio: pct(kpis.signups30d, kpis.totalUsers), color: NAVY },
    { icon: UserRound, value: kpis.totalAuPairs, label: d.auPairs, caption: d.shareOfUsers(pct(kpis.totalAuPairs, kpis.totalUsers)), ratio: pct(kpis.totalAuPairs, kpis.totalUsers), color: BLUE },
    { icon: House, value: kpis.totalFamilies, label: d.families, caption: d.shareOfUsers(pct(kpis.totalFamilies, kpis.totalUsers)), ratio: pct(kpis.totalFamilies, kpis.totalUsers), color: GREEN },
    { icon: CreditCard, value: kpis.activeSubscriptions, label: d.activeSubscriptions, caption: d.shareOfAuPairs(pct(kpis.activeSubscriptions, kpis.totalAuPairs)), ratio: pct(kpis.activeSubscriptions, kpis.totalAuPairs), color: TEAL },
    { icon: Hourglass, value: kpis.pendingProfiles, label: d.pendingProfiles, caption: d.shareOfProfiles(pct(kpis.pendingProfiles, kpis.totalAuPairs + kpis.totalFamilies)), ratio: pct(kpis.pendingProfiles, kpis.totalAuPairs + kpis.totalFamilies), color: INDIGO },
  ];

  // Statuts cumulés au pairs + familles pour la jauge de validation
  const statusTotal = (key: string) => (analytics.auPairStatus[key] ?? 0) + (analytics.familyStatus[key] ?? 0);
  const active = statusTotal("ACTIVE");
  const pending = statusTotal("PENDING");
  const other = statusTotal("HIDDEN") + statusTotal("SUSPENDED");
  const validationPct = pct(active, active + pending + other);

  const countries = countryTab === "auPair" ? analytics.topCountries : analytics.topFamilyCountries;
  const countriesTotal = countries.reduce((sum, x) => sum + x.count, 0);

  const signupsConfig: ChartConfig = {
    auPair: { label: ta.auPairs, color: ORANGE },
    famille: { label: ta.families, color: BLUE },
  };
  const revenueConfig: ChartConfig = { amount: { label: ta.revenueTitle, color: ORANGE } };
  const gaugeConfig: ChartConfig = { value: { label: d.validationTitle, color: GREEN } };
  const lastMonthIndex = analytics.revenueByMonth.length - 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className={PAGE_TITLE}>{d.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {kpis.openReports > 0 && (
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-gray-200 bg-white/80 text-sm text-[#1A1A2E] hover:border-[#E87722]/40 transition-colors"
              >
                <Flag {...ICON} size={16} className="text-[#E87722]" />
                {d.reportsCount(kpis.openReports)}
              </Link>
            )}
            {kpis.pendingProfiles > 0 && (
              <Link
                href="/admin/moderation"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#F08A3C] to-[#E87722] text-white text-sm shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition"
              >
                <ShieldCheck {...ICON} size={16} />
                {d.moderateCount(kpis.pendingProfiles)}
              </Link>
            )}
          </div>
        </div>
        <Separator />

        {/* KPIs */}
        <KpiGrid items={kpiCards} />

        {/* Inscriptions + jauge de validation */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel className="p-5 lg:col-span-2" tint={BLUE}>
            <PanelHeader
              icon={UserPlus}
              color={BLUE}
              title={ta.signupsTitle}
              subtitle={ta.signupsSubtitle}
              action={
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />{ta.auPairs}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: BLUE }} />{ta.families}</span>
                </div>
              }
            />
            <ChartContainer config={signupsConfig} className="aspect-auto h-[240px] w-full">
              <AreaChart data={analytics.signupsByMonth} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="dashFillAuPair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-auPair)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-auPair)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashFillFamille" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-famille)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--color-famille)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={formatMonth} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip
                  cursor={{ stroke: "#d1d5db", strokeWidth: 1, strokeDasharray: "4 4" }}
                  content={<ChartTooltipContent indicator="dot" labelFormatter={(value) => formatMonth(String(value))} />}
                />
                <Area dataKey="famille" type="monotone" fill="url(#dashFillFamille)" stroke="var(--color-famille)" strokeWidth={2} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
                <Area dataKey="auPair" type="monotone" fill="url(#dashFillAuPair)" stroke="var(--color-auPair)" strokeWidth={2} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ChartContainer>
          </Panel>

          <Panel className="p-5 flex flex-col" tint={GREEN}>
            <PanelHeader icon={BadgeCheck} color={GREEN} title={d.validationTitle} subtitle={d.validationSubtitle} />
            <div className="relative flex-1 min-h-[170px]">
              <ChartContainer config={gaugeConfig} className="mx-auto aspect-[2/1] w-full max-w-[260px]">
                <RadialBarChart
                  data={[{ name: "value", value: validationPct, fill: "url(#dashGauge)" }]}
                  startAngle={180}
                  endAngle={0}
                  cx="50%"
                  cy="100%"
                  innerRadius="140%"
                  outerRadius="190%"
                >
                  <defs>
                    <linearGradient id="dashGauge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7CCB8E" />
                      <stop offset="100%" stopColor={GREEN} />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                  <RadialBar dataKey="value" background={{ fill: "#f3f4f6" }} cornerRadius={10} />
                </RadialBarChart>
              </ChartContainer>
              <div className="absolute inset-x-0 bottom-1 text-center">
                <p className="text-3xl font-semibold text-[#1A1A2E] tabular-nums">{validationPct}%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
              {[
                { label: d.statusActive, value: active, color: GREEN },
                { label: d.statusPending, value: pending, color: ORANGE },
                { label: d.statusOther, value: other, color: "#9ca3af" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-base font-medium text-[#1A1A2E] tabular-nums">{s.value}</p>
                  <p className="flex items-center justify-center gap-1 text-[11px] text-gray-500 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Pays + revenus */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel className="p-5" tint={TEAL}>
            <PanelHeader
              icon={Globe2}
              color={TEAL}
              title={d.countriesTitle}
              action={
                <Segmented
                  value={countryTab}
                  onChange={setCountryTab}
                  options={[
                    { value: "auPair", label: ta.auPairs },
                    { value: "famille", label: ta.families },
                  ]}
                />
              }
            />
            {countries.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{c.noData}</p>
            ) : (
              <ul className="space-y-4">
                {countries.map((country, i) => {
                  const share = pct(country.count, countriesTotal);
                  return (
                    <li key={country.country}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-gray-700 min-w-0">
                          {country.flag && <CountryFlag flag={country.flag} className="h-3 w-[18px] object-cover rounded-[2px] shrink-0" />}
                          <span className="truncate">{country.country ? tValue(country.country) : d.unknownCountry}</span>
                        </span>
                        <span className="text-gray-500 tabular-nums">{country.count} · {share}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-700"
                          style={{ width: `${share}%`, background: SERIES[i % SERIES.length] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel className="p-5 lg:col-span-2" tint={INDIGO}>
            <PanelHeader
              icon={Wallet}
              color={INDIGO}
              title={ta.revenueTitle}
              subtitle={ta.revenueSubtitle}
              action={
                <div className="text-right">
                  <p className="text-base font-medium text-[#1A1A2E] tabular-nums">{kpis.revenue30d}</p>
                  <p className="text-xs text-gray-400">{d.revenue30d} · {d.totalRevenue} {kpis.totalRevenue}</p>
                </div>
              }
            />
            <ChartContainer config={revenueConfig} className="aspect-auto h-[220px] w-full">
              <BarChart data={analytics.revenueByMonth} margin={{ left: 0, right: 8, top: 8 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={formatMonth} />
                <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => compact.format(Number(v))} />
                <ChartTooltip
                  cursor={{ fill: "#f9fafb" }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatMonth(String(value))}
                      formatter={(value) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{ta.revenueTitle}</span>
                          <span className="text-foreground font-medium tabular-nums">
                            {formatCurrency(Number(value), "XOF", locale)}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar dataKey="amount" radius={[6, 6, 2, 2]} maxBarSize={36}>
                  {analytics.revenueByMonth.map((entry, i) => (
                    <Cell key={entry.month} fill={ORANGE} fillOpacity={i === lastMonthIndex ? 1 : 0.35} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </Panel>
        </div>

        {/* Activité récente */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Panel tint={BLUE}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="flex items-center gap-3 text-[15px] font-medium text-[#1A1A2E]">
                <IconChip icon={UserPlus} color={BLUE} />
                {d.latestSignups}
              </h2>
              <Link href="/admin/utilisateurs" className="text-xs text-[#E87722] hover:underline">
                {c.seeAll}
              </Link>
            </div>
            <div className="divide-y divide-gray-200/50">
              {recentUsers.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">{d.noRecentSignups}</p>
              ) : recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 bg-[#EEF2FA] text-[#3A5BA8] rounded-full flex items-center justify-center text-sm overflow-hidden">
                      {u.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.photoUrl} alt="" className="w-full h-full object-cover object-top" />
                      ) : (
                        (u.name || "?").charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#1A1A2E] truncate">{u.name || (u.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily)}</p>
                      <p className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
                        {u.country && <CountryFlag flag={u.country.split(" ")[0]} className="h-2.5 w-[15px] object-cover rounded-[2px] shrink-0" />}
                        <span className="truncate">{u.country.split(" ").slice(1).join(" ")}{u.country ? " · " : ""}{relativeDate(u.date)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={u.role === "AU_PAIR" ? "default" : "secondary"}>
                      {u.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}
                    </Badge>
                    <Badge variant={u.status === "ACTIVE" ? "success" : "warning"}>
                      {u.status === "ACTIVE" ? c.profileStatus.ACTIVE : c.profileStatus.PENDING}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel tint={TEAL}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="flex items-center gap-3 text-[15px] font-medium text-[#1A1A2E]">
                <IconChip icon={Receipt} color={TEAL} />
                {d.latestPayments}
              </h2>
              <Link href="/admin/paiements" className="text-xs text-[#E87722] hover:underline">
                {c.seeAll}
              </Link>
            </div>
            <div className="divide-y divide-gray-200/50">
              {recentPayments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">{d.noRecentPayments}</p>
              ) : recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#1A1A2E] truncate">{p.user || c.unknownUser}</p>
                    <p className="text-xs text-gray-400 truncate">{t.adminPayments.methods[p.method as keyof typeof t.adminPayments.methods] ?? p.method} · {relativeDate(p.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-[#1A1A2E] tabular-nums">{p.amount}</span>
                    <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>
                      {p.status === "ACTIVE" ? d.paid : (t.adminPayments.statuses[p.status as keyof typeof t.adminPayments.statuses] ?? p.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AdminLayout>
  );
}
