"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Flag, Loader2, RotateCcw, CalendarClock, UserX, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { BLUE, GREEN, INDIGO, ORANGE, PAGE_TITLE, KpiGrid, pct } from "@/components/admin/AdminUI";
import { useAdminCan } from "@/components/admin/AdminPermissionsContext";
import { AdminAvatar, AdminDateTime, AdminIconButton, TD, TH } from "@/components/admin/AdminTable";

type ReportUser = { id: string; name: string; avatar: string | null; role: string } | null;

type Report = {
  id: string;
  reason: string;
  description: string | null;
  isResolved: boolean;
  createdAt: string;
  reporter: ReportUser;
  reported: ReportUser;
};

type ReportFilter = "open" | "resolved" | "all";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [filter, setFilter] = useState<ReportFilter>("open");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { t, locale, tValue } = useI18n();
  const can = useAdminCan();
  const canResolve = can("reports.resolve");
  const c = t.adminCommon;
  const r = t.adminReports;

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports ?? []);
        setNow(Date.now());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReport = async (reportId: string, action: "resolve" | "reopen") => {
    setProcessingId(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((item) => (item.id === reportId ? { ...item, isResolved: action === "resolve" } : item)));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const open = reports.filter((item) => !item.isResolved);
  const resolvedCount = reports.length - open.length;
  const last7d = reports.filter((item) => now - new Date(item.createdAt).getTime() < WEEK_MS).length;
  const targets = new Set(open.map((item) => item.reported?.id).filter(Boolean)).size;
  const filtered = filter === "all" ? reports : reports.filter((item) => item.isResolved === (filter === "resolved"));

  const kpis = [
    { icon: Flag, value: open.length, label: r.kpiOpen, caption: r.kpiOpenCaption, ratio: pct(open.length, reports.length), color: ORANGE },
    { icon: CheckCheck, value: resolvedCount, label: r.kpiResolved, caption: r.kpiResolvedCaption(pct(resolvedCount, reports.length)), ratio: pct(resolvedCount, reports.length), color: GREEN },
    { icon: CalendarClock, value: last7d, label: r.kpiLast7d, caption: r.kpiLast7dCaption, ratio: pct(last7d, reports.length), color: INDIGO },
    { icon: UserX, value: targets, label: r.kpiTargets, caption: r.kpiTargetsCaption, ratio: pct(targets, open.length), color: BLUE },
  ];

  const renderUser = (u: ReportUser) => {
    if (!u) return <span className="text-xs text-gray-400">{c.unknownUser}</span>;
    const content = (
      <span className="flex items-center gap-2">
        <AdminAvatar name={u.name} src={u.avatar} size="w-7 h-7" />
        <span className="text-sm font-medium text-[#1A1A2E] whitespace-nowrap">{u.name}</span>
      </span>
    );
    return u.role === "AU_PAIR" || u.role === "FAMILLE" ? (
      <Link href={`/admin/profil/${u.id}?role=${u.role}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {content}
      </Link>
    ) : (
      content
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className={PAGE_TITLE}>{r.title}</h1>
          <Badge variant="destructive">{r.openCount(open.length)}</Badge>
        </div>
        <Separator />

        {!loading && <KpiGrid items={kpis} />}

        <div className="flex flex-wrap gap-2">
          {(["open", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f ? "bg-[#1A1A2E] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-[#E87722]"
              }`}
            >
              {f === "open" ? r.filterOpen : f === "resolved" ? r.filterResolved : r.filterAll}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{filter === "open" ? r.noReports : r.noReportsFilter}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={`${TH} w-12`}>#</th>
                    <th className={TH}>{r.colDate}</th>
                    <th className={TH}>{r.colReason}</th>
                    <th className={TH}>{r.colReporter}</th>
                    <th className={TH}>{r.colReported}</th>
                    <th className={TH}>{r.colDescription}</th>
                    <th className={TH}>{c.status}</th>
                    <th className={`${TH} text-right`}>{c.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((item, i) => {
                    const busy = processingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className={`${TD} text-xs text-gray-400 tabular-nums`}>{i + 1}</td>
                        <td className={TD}>
                          <AdminDateTime value={item.createdAt} locale={locale} />
                        </td>
                        <td className={TD}>
                          <span className="flex items-center gap-1.5 font-medium text-[#1A1A2E] whitespace-nowrap">
                            <Flag className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            {tValue(item.reason)}
                          </span>
                        </td>
                        <td className={TD}>{renderUser(item.reporter)}</td>
                        <td className={TD}>{renderUser(item.reported)}</td>
                        <td className={TD}>
                          {item.description ? (
                            <p className="text-xs text-gray-500 italic line-clamp-2 min-w-[200px] max-w-[320px]" title={item.description}>
                              {item.description}
                            </p>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className={TD}>
                          <Badge variant={item.isResolved ? "success" : "destructive"}>
                            {item.isResolved ? r.statusResolved : r.statusOpen}
                          </Badge>
                        </td>
                        <td className={TD}>
                          <div className="flex items-center justify-end gap-1">
                            {canResolve &&
                              (item.isResolved ? (
                                <AdminIconButton title={r.reopen} disabled={busy} onClick={() => handleReport(item.id, "reopen")} className="text-gray-500 hover:bg-gray-100">
                                  <RotateCcw className="w-4 h-4" />
                                </AdminIconButton>
                              ) : (
                                <AdminIconButton title={r.markResolved} disabled={busy} onClick={() => handleReport(item.id, "resolve")} className="text-green-600 hover:bg-green-50">
                                  <CheckCircle className="w-4 h-4" />
                                </AdminIconButton>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
