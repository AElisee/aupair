"use client";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Separator } from "@/components/ui/separator";
import { SelectField } from "@/components/ui/select-field";
import { DateField } from "@/components/ui/date-field";
import Pagination from "@/components/admin/Pagination";
import { MODULE_ICONS } from "@/components/admin/team/module-icons";
import { BLUE, GREEN, INDIGO, ORANGE, PAGE_TITLE, KpiGrid, Panel, TEAL, pct } from "@/components/admin/AdminUI";
import { useI18n } from "@/i18n";
import { ADMIN_LOG_MODULES, type AdminLogDTO, type AdminLogModule } from "@/lib/admin-activity-shared";
import { Activity, CalendarDays, History, Loader2, LogIn, RotateCcw, Search, UserCog, Users, type LucideIcon } from "lucide-react";

type ActivityResponse = {
  items: AdminLogDTO[];
  total: number;
  page: number;
  pageSize: number;
  stats: { today: number; last7d: number; activeAdmins7d: number };
  admins: { id: string; name: string }[];
};

/** Icône et couleur de chaque module du journal */
const LOG_ICONS: Record<AdminLogModule, LucideIcon> = { ...MODULE_ICONS, auth: LogIn, team: UserCog };
const LOG_COLORS: Record<AdminLogModule, string> = {
  auth: "#6B7280",
  users: BLUE,
  moderation: GREEN,
  reports: "#DC2626",
  payments: TEAL,
  countries: INDIGO,
  blog: INDIGO,
  faq: INDIGO,
  testimonials: ORANGE,
  tickets: TEAL,
  settings: "#C2410C",
  team: ORANGE,
};

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Regroupe les lignes par jour (ordre antichronologique conservé) avec « Aujourd'hui » / « Hier » */
function groupByDay(items: AdminLogDTO[], locale: string, labels: { today: string; yesterday: string }) {
  const out: { key: string; label: string; items: AdminLogDTO[] }[] = [];
  const todayKey = dayKey(new Date().toISOString());
  const yesterdayKey = dayKey(new Date(Date.now() - 86400000).toISOString());
  for (const item of items) {
    const key = dayKey(item.createdAt);
    let group = out.find((g) => g.key === key);
    if (!group) {
      const label =
        key === todayKey ? labels.today
        : key === yesterdayKey ? labels.yesterday
        : new Date(item.createdAt).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      group = { key, label, items: [] };
      out.push(group);
    }
    group.items.push(item);
  }
  return out;
}

export default function AdminActivityLogPage() {
  const { t, locale, tValue } = useI18n();
  const tl = t.adminLogs;
  const c = t.adminCommon;

  /** Dernière réponse reçue, avec la requête qui l'a produite (le chargement en cours s'en déduit) */
  const [result, setResult] = useState<{ key: string; data: ActivityResponse | null; error: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // Recherche différée pour ne pas interroger l'API à chaque frappe
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const requestKey = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (moduleFilter) params.set("module", moduleFilter);
    if (adminFilter) params.set("adminId", adminFilter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (query) params.set("q", query);
    return params.toString();
  }, [page, moduleFilter, adminFilter, from, to, query]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/activity?${requestKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ActivityResponse) => !cancelled && setResult({ key: requestKey, data: d, error: false }))
      .catch(() => !cancelled && setResult((prev) => ({ key: requestKey, data: prev?.data ?? null, error: true })));
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const data = result?.data ?? null;
  const loading = result?.key !== requestKey;
  const error = !loading && !!result?.error;

  const setFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };
  const hasFilters = !!(moduleFilter || adminFilter || from || to || search);
  const resetFilters = () => {
    setModuleFilter("");
    setAdminFilter("");
    setFrom("");
    setTo("");
    setSearch("");
    setQuery("");
    setPage(1);
  };

  const groups = useMemo(
    () => groupByDay(data?.items ?? [], locale, { today: tl.today, yesterday: tl.yesterday }),
    [data, locale, tl]
  );

  /** Résumé lisible du champ `details` (jamais de valeurs sensibles : seuls des noms de champs sont stockés) */
  const detailChips = (log: AdminLogDTO): string[] => {
    const d = log.details ?? {};
    const chips: string[] = [];
    if (Array.isArray(d.fields) && d.fields.length) chips.push(tl.detailFields(d.fields.join(", ")));
    if (typeof d.rows === "number") chips.push(tl.detailRows(d.rows));
    if (typeof d.role === "string") chips.push(tl.detailRole(d.role));
    if (typeof d.previousName === "string") chips.push(tl.detailPreviousName(d.previousName));
    if (Array.isArray(d.permissions)) chips.push(tl.detailRights(d.permissions.length));
    if (Array.isArray(d.added) && d.added.length) chips.push(tl.detailAdded(d.added.length));
    if (Array.isArray(d.removed) && d.removed.length) chips.push(tl.detailRemoved(d.removed.length));
    if (typeof d.subject === "string") chips.push(tl.detailSubject(d.subject));
    if (d.status === "FAILED") chips.push(tl.detailEmailFailed);
    else if (typeof d.status === "string" && log.module === "tickets") chips.push(tl.detailStatus(t.adminTickets.statuses[d.status as keyof typeof t.adminTickets.statuses] ?? d.status));
    else if (typeof d.status === "string" && log.module === "moderation") chips.push(tl.detailStatus(c.profileStatus[d.status as keyof typeof c.profileStatus] ?? d.status));
    if (typeof d.priority === "string") chips.push(tl.detailPriority(t.adminTickets.priorities[d.priority as keyof typeof t.adminTickets.priorities] ?? d.priority));
    if (typeof d.isPublished === "boolean") chips.push(d.isPublished ? tl.detailPublished : tl.detailUnpublished);
    if (typeof d.isActive === "boolean") chips.push(d.isActive ? tl.detailEnabled : tl.detailDisabled);
    if (d.action === "resolve") chips.push(tl.detailReportResolved);
    if (d.action === "reopen") chips.push(tl.detailReportReopened);
    return chips;
  };

  const stats = data?.stats;
  const total = data?.total ?? 0;
  const kpis = stats
    ? [
        { icon: Activity, label: tl.kpiToday, value: stats.today, ratio: pct(stats.today, stats.last7d), color: ORANGE },
        { icon: CalendarDays, label: tl.kpi7d, value: stats.last7d, ratio: 100, color: BLUE },
        { icon: Users, label: tl.kpiAdmins, value: stats.activeAdmins7d, ratio: pct(stats.activeAdmins7d, data?.admins.length ?? 0), color: GREEN },
        { icon: History, label: tl.kpiTotal, value: total, ratio: 100, color: INDIGO },
      ]
    : [];

  const totalPages = data ? Math.max(1, Math.ceil(total / data.pageSize)) : 1;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className={PAGE_TITLE}>{tl.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{tl.subtitle}</p>
        </div>
        <Separator />

        {kpis.length > 0 && <KpiGrid items={kpis} />}

        {/* Filtres */}
        <Panel className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tl.search}
              className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-xl text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
          </div>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_160px_auto] gap-2 items-center">
            <SelectField value={moduleFilter} onChange={setFilter(setModuleFilter)} size="sm"
              options={[{ value: "", label: tl.allModules }, ...ADMIN_LOG_MODULES.map((m) => ({ value: m, label: tl.modules[m] }))]} />
            <SelectField value={adminFilter} onChange={setFilter(setAdminFilter)} size="sm"
              options={[{ value: "", label: tl.allAdmins }, ...(data?.admins ?? []).map((a) => ({ value: a.id, label: a.name }))]} />
            <DateField value={from} onChange={setFilter(setFrom)} max={to || undefined} placeholder={tl.from} aria-label={tl.from} />
            <DateField value={to} onChange={setFilter(setTo)} min={from || undefined} placeholder={tl.to} aria-label={tl.to} />
            <button onClick={resetFilters} disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-sm text-gray-600 hover:text-[#E87722] disabled:opacity-40 disabled:hover:text-gray-600">
              <RotateCcw className="w-4 h-4" />{tl.reset}
            </button>
          </div>
        </Panel>

        {/* Chronologie */}
        <Panel className="overflow-hidden">
          {loading && !data ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </div>
          ) : error ? (
            <p className="p-10 text-center text-sm text-gray-500">{c.networkError}</p>
          ) : groups.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-2" strokeWidth={1.25} />
              <p className="text-sm text-gray-400">{tl.empty}</p>
            </div>
          ) : (
            <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {groups.map((g) => (
                <section key={g.key}>
                  <h2 className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50/90 border-y border-gray-100 first-letter:uppercase">
                    {g.label}
                  </h2>
                  <ul className="divide-y divide-gray-100">
                    {g.items.map((log) => {
                      const mod = (ADMIN_LOG_MODULES as readonly string[]).includes(log.module) ? (log.module as AdminLogModule) : "settings";
                      const Icon = LOG_ICONS[mod];
                      const color = LOG_COLORS[mod];
                      const actionText = tl.actions[log.action as keyof typeof tl.actions] ?? log.action;
                      const chips = detailChips(log);
                      return (
                        <li key={log.id} className="flex gap-3 px-4 py-3">
                          <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center mt-0.5" style={{ background: `${color}1A`, color }}>
                            <Icon size={18} strokeWidth={1.25} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-700 leading-snug break-words">
                              <span className="font-medium text-[#1A1A2E]">{log.adminName || log.adminEmail || tl.unknownAdmin}</span>{" "}
                              {actionText}
                              {log.targetLabel && log.action !== "auth.login" && (
                                <> <span className="font-medium text-[#1A1A2E]">{tValue(log.targetLabel)}</span></>
                              )}
                            </p>
                            {chips.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {chips.map((chip, i) => (
                                  <span key={i} className="text-[11px] text-gray-600 bg-gray-100 rounded-md px-1.5 py-0.5 max-w-full truncate">{chip}</span>
                                ))}
                              </div>
                            )}
                            <p className="text-[11px] text-gray-400 mt-1 flex flex-wrap gap-x-2">
                              <span className="tabular-nums">{new Date(log.createdAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span>
                              <span>· {tl.modules[mod]}</span>
                              {log.ip && log.ip !== "unknown" && <span>· {tl.ip(log.ip)}</span>}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
          {data && total > data.pageSize && (
            <Pagination currentPage={page} totalPages={totalPages} pageSize={data.pageSize} totalItems={total} onPageChange={setPage} />
          )}
        </Panel>
      </div>
    </AdminLayout>
  );
}
