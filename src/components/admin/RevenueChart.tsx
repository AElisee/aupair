"use client";

import { Bar, CartesianGrid, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Wallet } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/i18n";
import type { RevenueMonth } from "@/lib/admin-revenue";
import { BLUE, GREEN, INDIGO, ORANGE, Panel, PanelHeader } from "./AdminUI";

/** Revenus encaissés par mois (barres total + courbes Mobile Money / carte) */
export default function RevenueChart({
  data,
  last30d,
  total,
  className = "",
}: {
  data: RevenueMonth[];
  last30d: string;
  total: string;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const d = t.adminDashboard;
  const ta = t.adminAnalytics;

  // Mois reçus au format AAAA-MM → "févr." / "Feb" selon la langue
  const formatMonth = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(year, month - 1, 1));
  };
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });

  const config = {
    amount: { label: ta.revenueTotal, color: ORANGE },
    mobileMoney: { label: ta.revenueMobileMoney, color: GREEN },
    card: { label: ta.revenueCard, color: BLUE },
  } satisfies ChartConfig;
  const lastMonthIndex = data.length - 1;

  return (
    <Panel className={`p-5 ${className}`} tint={INDIGO}>
      <PanelHeader
        icon={Wallet}
        color={INDIGO}
        title={ta.revenueTitle}
        subtitle={ta.revenueSubtitle}
        action={
          <div className="text-right">
            <p className="text-base font-medium text-[#1A1A2E] tabular-nums">{last30d}</p>
            <p className="text-xs text-gray-400">{d.revenue30d} · {d.totalRevenue} {total}</p>
          </div>
        }
      />
      <div className="flex flex-wrap items-center gap-3 mb-2 text-xs text-gray-500">
        {Object.values(config).map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
        <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={formatMonth} />
          <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => compact.format(Number(v))} />
          <ChartTooltip
            cursor={{ fill: "#f9fafb" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => formatMonth(String(value))}
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: config[name as keyof typeof config]?.color }}
                      />
                      {config[name as keyof typeof config]?.label ?? name}
                    </span>
                    <span className="text-foreground font-medium tabular-nums">
                      {formatCurrency(Number(value), "XOF", locale)}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="amount" radius={[6, 6, 2, 2]} maxBarSize={36}>
            {data.map((entry, i) => (
              <Cell key={entry.month} fill={ORANGE} fillOpacity={i === lastMonthIndex ? 1 : 0.35} />
            ))}
          </Bar>
          <Line dataKey="mobileMoney" type="monotone" stroke="var(--color-mobileMoney)" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "var(--color-mobileMoney)" }} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
          <Line dataKey="card" type="monotone" stroke="var(--color-card)" strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: "var(--color-card)" }} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
        </ComposedChart>
      </ChartContainer>
    </Panel>
  );
}
