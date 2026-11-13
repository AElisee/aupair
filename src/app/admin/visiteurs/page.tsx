"use client";
import { useEffect, useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { CalendarDays, CalendarRange, Eye, Loader2, TrendingDown, TrendingUp, Users } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { SelectField } from "@/components/ui/select-field";
import { BLUE, GREEN, INDIGO, ORANGE, PAGE_TITLE, TEAL, IconChip, KpiGrid, Panel, PanelHeader, pct } from "@/components/admin/AdminUI";
import { TH, TD } from "@/components/admin/AdminTable";
import { useI18n } from "@/i18n";
import { VISITOR_RANGES, type VisitorGranularity, type VisitorPoint } from "@/lib/site-visits-shared";
import type { VisitorStats } from "@/lib/site-visits";

type VisitorsResponse = {
  granularity: VisitorGranularity;
  count: number;
  points: VisitorPoint[];
  rangeUnique: number;
  rangeWithAccount: number;
  prevRangeUnique: number;
  stats: VisitorStats;
};

const GRANULARITIES: VisitorGranularity[] = ["day", "week", "month"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Variation en % (100 % si on part de 0 avec des visites) */
const change = (current: number, previous: number) =>
  previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

export default function VisiteursPage() {
  const { t, locale } = useI18n();
  const tv = t.adminVisitors;
  const [granularity, setGranularity] = useState<VisitorGranularity>("day");
  const [count, setCount] = useState<number>(VISITOR_RANGES.day[0]);
  const [data, setData] = useState<VisitorsResponse | null>(null);
  // Clé (granularité + plage) de la dernière réponse reçue : chargement = clé différente de la sélection
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const requestKey = `${granularity}:${count}`;
  const loading = loadedKey !== requestKey && !error;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/visitors?granularity=${granularity}&count=${count}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: VisitorsResponse) => {
        if (cancelled) return;
        setData(json);
        setError(false);
        setLoadedKey(`${granularity}:${count}`);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [granularity, count]);

  const changeGranularity = (g: VisitorGranularity) => {
    setGranularity(g);
    setCount(VISITOR_RANGES[g][0]);
  };

  // Clés de période en UTC (comme en base) : on formate en UTC pour ne pas décaler d'un jour
  const fmt = useMemo(() => {
    const make = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts });
    const dayShort = make({ day: "numeric", month: "short" });
    const dayLong = make({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const dayYear = make({ day: "numeric", month: "short", year: "numeric" });
    const monthShort = make({ month: "short", year: "2-digit" });
    const monthLong = make({ month: "long", year: "numeric" });
    const parse = (period: string) => new Date(period.length === 7 ? `${period}-01T00:00:00Z` : `${period}T00:00:00Z`);
    return {
      tick: (period: string, g: VisitorGranularity) =>
        g === "month" ? monthShort.format(parse(period)) : dayShort.format(parse(period)),
      full: (period: string, g: VisitorGranularity) => {
        const d = parse(period);
        if (g === "day") return dayLong.format(d);
        if (g === "month") return monthLong.format(d);
        return tv.weekRange(dayShort.format(d), dayYear.format(new Date(d.getTime() + 6 * DAY_MS)));
      },
    };
  }, [locale, tv]);
  const formatNumber = (n: number) => new Intl.NumberFormat(locale).format(n);

  const stats = data?.stats;
  const trend30 = stats ? change(stats.last30d, stats.prev30d) : 0;
  const kpis = stats
    ? [
        { icon: Eye, value: formatNumber(stats.today), label: tv.kpiToday, caption: tv.kpiTodayCaption(pct(stats.today, stats.last7d)), ratio: pct(stats.today, stats.last7d), color: ORANGE },
        { icon: CalendarDays, value: formatNumber(stats.last7d), label: tv.kpi7d, caption: tv.kpi7dCaption(pct(stats.last7d, stats.last30d)), ratio: pct(stats.last7d, stats.last30d), color: BLUE },
        {
          icon: CalendarRange,
          value: formatNumber(stats.last30d),
          label: tv.kpi30d,
          caption: tv.kpiTrend(signed(trend30)),
          ratio: stats.last30d === 0 ? 0 : pct(stats.last30d, Math.max(stats.last30d, stats.prev30d)),
          color: GREEN,
        },
        { icon: Users, value: formatNumber(stats.total), label: tv.kpiTotal, caption: tv.kpiTotalCaption, ratio: 100, color: INDIGO },
      ]
    : [];

  // Statistiques de la plage affichée
  const points = data?.points ?? [];
  const g = data?.granularity ?? granularity;
  const sum = points.reduce((acc, p) => acc + p.visitors, 0);
  const average = points.length > 0 ? Math.round(sum / points.length) : 0;
  const rangeChange = data ? change(data.rangeUnique, data.prevRangeUnique) : 0;
  const RangeTrendIcon = rangeChange < 0 ? TrendingDown : TrendingUp;

  const signupsSum = points.reduce((acc, p) => acc + p.signups, 0);

  // Aires empilées : « avec compte » en bas (couleur de marque), « sans compte » au-dessus ;
  // inscriptions en courbe non empilée par-dessus
  const config = {
    withAccount: { label: tv.withAccount, color: ORANGE },
    withoutAccount: { label: tv.withoutAccount, color: BLUE },
    signups: { label: tv.signups, color: GREEN },
  } satisfies ChartConfig;
  // Pas trop d'étiquettes sur l'axe X (90 jours, 52 semaines…)
  const tickInterval = points.length > 14 ? Math.ceil(points.length / 10) - 1 : 0;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className={PAGE_TITLE}>{tv.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{tv.subtitle}</p>
        </div>
        <Separator />

        {error && !data ? (
          <Panel className="p-8 text-center text-sm text-red-600">{tv.loadError}</Panel>
        ) : !data ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto animate-spin" />
          </div>
        ) : (
          <>
            <KpiGrid items={kpis} />

            <Panel tint={ORANGE}>
              {/* En-tête façon shadcn « Area Chart – Interactive » : titre à gauche, filtres à droite */}
              <div className="flex flex-col gap-3 border-b border-gray-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <IconChip icon={TrendingUp} color={ORANGE} />
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-medium text-[#1A1A2E]">{tv.chartTitle}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tv.chartSubtitle[g]} · {tv.range[granularity](count)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                  {/* Granularité : contrôle segmenté */}
                  <div role="tablist" className="inline-flex p-1 rounded-xl bg-gray-100/80 border border-gray-200/60">
                    {GRANULARITIES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={granularity === item}
                        onClick={() => changeGranularity(item)}
                        className={`px-3 h-7 rounded-lg text-xs font-medium transition-colors ${
                          granularity === item ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-500 hover:text-[#1A1A2E]"
                        }`}
                      >
                        {tv.granularity[item]}
                      </button>
                    ))}
                  </div>
                  <SelectField
                    value={String(count)}
                    onChange={(v) => setCount(Number(v))}
                    options={VISITOR_RANGES[granularity].map((n) => ({ value: String(n), label: tv.range[granularity](n) }))}
                    size="xs"
                    className="w-44"
                    aria-label={tv.rangeAria}
                  />
                </div>
              </div>

              <div className="px-2 pt-4 pb-4 sm:px-5 sm:pt-5">
                {/* Résumé de la plage */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 px-3 sm:px-0">
                  {[
                    { label: tv.statRangeUnique, value: formatNumber(data.rangeUnique) },
                    {
                      label: tv.statWithAccount,
                      value: formatNumber(data.rangeWithAccount),
                      hint: tv.statWithAccountCaption(pct(data.rangeWithAccount, data.rangeUnique)),
                    },
                    { label: tv.statAverage[g], value: formatNumber(average) },
                    {
                      label: tv.statChange,
                      value: (
                        <span className={`inline-flex items-center gap-1 ${rangeChange < 0 ? "text-red-600" : "text-[#3FA45B]"}`}>
                          <RangeTrendIcon size={16} strokeWidth={1.5} />
                          {signed(rangeChange)}
                        </span>
                      ),
                    },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-200/60 bg-white/70 px-3.5 py-2.5 min-w-0">
                      <p className="text-xs text-gray-500 truncate">{s.label}</p>
                      <p className="text-base font-semibold text-[#1A1A2E] tabular-nums">{s.value}</p>
                      {"hint" in s && s.hint && <p className="text-[11px] text-gray-400 truncate">{s.hint}</p>}
                    </div>
                  ))}
                </div>

                {sum === 0 && signupsSum === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-sm text-gray-500">{tv.empty}</div>
                ) : (
                  <ChartContainer config={config} className={`aspect-auto h-[300px] w-full transition-opacity ${loading ? "opacity-50" : ""}`}>
                    <ComposedChart data={points} margin={{ left: 0, right: 12, top: 8 }}>
                      <defs>
                        <linearGradient id="fillWithAccount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-withAccount)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--color-withAccount)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillWithoutAccount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-withoutAccount)" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="var(--color-withoutAccount)" stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="period"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        interval={tickInterval}
                        minTickGap={24}
                        tickFormatter={(v) => fmt.tick(String(v), g)}
                      />
                      <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            className="min-w-[15rem] gap-2 px-3 py-2"
                            labelClassName="first-letter:uppercase"
                            labelFormatter={(value) => fmt.full(String(value), g)}
                          />
                        }
                      />
                      <Area
                        dataKey="withAccount"
                        type="natural"
                        fill="url(#fillWithAccount)"
                        stroke="var(--color-withAccount)"
                        strokeWidth={2}
                        stackId="a"
                      />
                      <Area
                        dataKey="withoutAccount"
                        type="natural"
                        fill="url(#fillWithoutAccount)"
                        stroke="var(--color-withoutAccount)"
                        strokeWidth={2}
                        stackId="a"
                      />
                      <Line
                        dataKey="signups"
                        type="monotone"
                        stroke="var(--color-signups)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </ComposedChart>
                  </ChartContainer>
                )}

                <div className="mt-2 flex justify-end px-3 sm:px-0">
                  <button
                    type="button"
                    onClick={() => setShowTable((v) => !v)}
                    className="text-xs font-medium text-[#3A5BA8] hover:underline"
                    aria-expanded={showTable}
                  >
                    {showTable ? tv.hideTable : tv.showTable}
                  </button>
                </div>
              </div>
            </Panel>

            {showTable && (
              <Panel tint={TEAL}>
                <div className="px-5 pt-5">
                  <PanelHeader icon={CalendarDays} color={TEAL} title={tv.tableTitle} subtitle={tv.chartSubtitle[g]} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/70 border-y border-gray-100">
                      <tr>
                        <th className={TH}>{tv.colPeriod}</th>
                        <th className={`${TH} text-right`}>{tv.withAccount}</th>
                        <th className={`${TH} text-right`}>{tv.withoutAccount}</th>
                        <th className={`${TH} text-right`}>{tv.colVisitors}</th>
                        <th className={`${TH} text-right`}>{tv.signups}</th>
                        <th className={`${TH} text-right`}>{tv.colChange}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Plus récente d'abord ; l'évolution compare à la période précédente */}
                      {points
                        .map((p, i) => ({ ...p, prev: i > 0 ? points[i - 1].visitors : null }))
                        .reverse()
                        .map((p) => {
                          const delta = p.prev === null ? null : change(p.visitors, p.prev);
                          return (
                            <tr key={p.period} className="hover:bg-gray-50/60">
                              <td className={`${TD} text-gray-700 first-letter:uppercase whitespace-nowrap`}>{fmt.full(p.period, g)}</td>
                              <td className={`${TD} text-right text-gray-600 tabular-nums`}>{formatNumber(p.withAccount)}</td>
                              <td className={`${TD} text-right text-gray-600 tabular-nums`}>{formatNumber(p.withoutAccount)}</td>
                              <td className={`${TD} text-right font-medium text-[#1A1A2E] tabular-nums`}>{formatNumber(p.visitors)}</td>
                              <td className={`${TD} text-right text-gray-600 tabular-nums`}>{formatNumber(p.signups)}</td>
                              <td className={`${TD} text-right text-xs tabular-nums ${delta === null || delta === 0 ? "text-gray-400" : delta < 0 ? "text-red-600" : "text-[#3FA45B]"}`}>
                                {delta === null ? "—" : signed(delta)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
