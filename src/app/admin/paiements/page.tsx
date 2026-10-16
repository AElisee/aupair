"use client";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Smartphone, Globe, Download, Loader2, FileText, CalendarClock, Search, Printer } from "lucide-react";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { BLUE, GREEN, ICON, INDIGO, ORANGE, PAGE_TITLE, TEAL, KpiGrid, Panel, PanelHeader, pct } from "@/components/admin/AdminUI";
import { SelectField } from "@/components/ui/select-field";

type Payment = {
  id: string;
  user: string;
  email: string;
  amount: string;
  method: "MOBILE_MONEY" | "CARD" | "FEDAPAY" | "GENIUSPAY";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  date: string;
  expiresAt: string;
  invoiceUrl: string | null;
};

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

type PaymentsData = {
  kpis: {
    revenueActiveXof: string;
    revenueActiveEur: string | null;
    activeSubscriptions: number;
    mobileMoneyCount: number;
    cardCount: number;
    expiringSoon: number;
    totalPayments: number;
  };
  payments: Payment[];
};

const methodIcon = (method: Payment["method"]) => {
  const props = { ...ICON, size: 15 };
  if (method === "MOBILE_MONEY") return <Smartphone {...props} />;
  if (method === "CARD") return <CreditCard {...props} />;
  return <Globe {...props} />;
};

const STATUS_VARIANTS: Record<Payment["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  EXPIRED: "secondary",
  CANCELLED: "warning",
  REFUNDED: "destructive",
};

const STATUSES = Object.keys(STATUS_VARIANTS) as Payment["status"][];
const METHODS: Payment["method"][] = ["MOBILE_MONEY", "CARD", "FEDAPAY", "GENIUSPAY"];

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

const FILTER_INPUT = "h-9 border border-gray-200 rounded-xl text-sm bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#E87722]";
const TOOL_BUTTON = "inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm transition";

const TH ="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider";

export default function PaiementsPage() {
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  // Instant de chargement, référence pour le compte à rebours d'expiration
  const [loadedAt, setLoadedAt] = useState(0);
  const { t, locale } = useI18n();
  const c = t.adminCommon;
  const tp = t.adminPayments;

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        setData(json);
        setLoadedAt(Date.now());
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.payments ?? []).filter(
      (p) =>
        (!q || p.user.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) &&
        (!filterStatus || p.status === filterStatus) &&
        (!filterMethod || p.method === filterMethod),
    );
  }, [data, search, filterStatus, filterMethod]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // L'export CSV reprend les filtres du tableau
  const exportParams = new URLSearchParams();
  if (search.trim()) exportParams.set("q", search.trim());
  if (filterStatus) exportParams.set("status", filterStatus);
  if (filterMethod) exportParams.set("method", filterMethod);
  const exportQuery = exportParams.toString();
  const exportUrl = `/api/admin/payments/export${exportQuery ? `?${exportQuery}` : ""}`;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(locale);

  /** Imprime toutes les lignes filtrées (pas seulement la page courante) dans une fenêtre dédiée */
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=1000,height=700");
    if (!win) return;
    const head = [tp.colUser, "Email", tp.colAmount, tp.colMethod, c.status, tp.colDate, tp.colExpires];
    const rows = filtered.map((p) => [
      p.user || c.unknownUser,
      p.email,
      p.amount,
      tp.methods[p.method] ?? p.method,
      tp.statuses[p.status],
      formatDate(p.date),
      formatDate(p.expiresAt),
    ]);
    const cells = (row: string[], tag: "th" | "td") => row.map((v) => `<${tag}>${escapeHtml(v)}</${tag}>`).join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(tp.listTitle)}</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; color: #1A1A2E; margin: 24px; }
  h1 { font-size: 18px; font-weight: 500; margin: 0 0 4px; }
  p { font-size: 12px; color: #6b7280; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  th { font-weight: 500; color: #6b7280; text-transform: uppercase; font-size: 10px; letter-spacing: .05em; }
</style></head><body>
<h1>${escapeHtml(tp.listTitle)}</h1>
<p>${escapeHtml(tp.printedOn(new Date().toLocaleString(locale)))} · ${escapeHtml(tp.paymentsTotal(rows.length))}</p>
<table><thead><tr>${cells(head, "th")}</tr></thead><tbody>${rows.map((r) => `<tr>${cells(r, "td")}</tr>`).join("")}</tbody></table>
</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  /** "dans 12 j" / "aujourd'hui" / "expiré", à partir de la date d'expiration */
  const expiryHint = (iso: string) => {
    const days = Math.ceil((new Date(iso).getTime() - loadedAt) / DAY_MS);
    if (days < 0) return { label: tp.expired, className: "text-gray-400" };
    if (days === 0) return { label: tp.expiresToday, className: "text-[#E87722]" };
    return { label: tp.daysLeft(days), className: days <= 7 ? "text-[#E87722]" : "text-gray-400" };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className={PAGE_TITLE}>{tp.title}</h1>
        <Separator />

        {loading || !data ? (
          <Panel className="p-12 text-center">
            <Loader2 className="mx-auto mb-3 animate-spin text-[#E87722]" {...ICON} />
            <p className="text-sm text-gray-500">{c.loading}</p>
          </Panel>
        ) : (
          <>
            <KpiGrid
              items={[
                {
                  icon: Wallet,
                  value: data.kpis.revenueActiveXof,
                  label: tp.activeRevenue,
                  caption: data.kpis.revenueActiveEur ? `+ ${data.kpis.revenueActiveEur}` : tp.paymentsTotal(data.kpis.totalPayments),
                  ratio: pct(data.kpis.activeSubscriptions, data.kpis.totalPayments),
                  color: ORANGE,
                },
                {
                  icon: CreditCard,
                  value: data.kpis.activeSubscriptions,
                  label: tp.activeSubscriptions,
                  caption: tp.shareOfPayments(pct(data.kpis.activeSubscriptions, data.kpis.totalPayments)),
                  ratio: pct(data.kpis.activeSubscriptions, data.kpis.totalPayments),
                  color: TEAL,
                },
                {
                  icon: CalendarClock,
                  value: data.kpis.expiringSoon,
                  label: tp.expiringSoon,
                  caption: tp.shareOfActive(pct(data.kpis.expiringSoon, data.kpis.activeSubscriptions)),
                  ratio: pct(data.kpis.expiringSoon, data.kpis.activeSubscriptions),
                  color: INDIGO,
                },
                {
                  icon: Smartphone,
                  value: data.kpis.mobileMoneyCount,
                  label: tp.viaMobileMoney,
                  caption: tp.shareOfPayments(pct(data.kpis.mobileMoneyCount, data.kpis.totalPayments)),
                  ratio: pct(data.kpis.mobileMoneyCount, data.kpis.totalPayments),
                  color: BLUE,
                },
                {
                  icon: CreditCard,
                  value: data.kpis.cardCount,
                  label: tp.viaCard,
                  caption: tp.shareOfPayments(pct(data.kpis.cardCount, data.kpis.totalPayments)),
                  ratio: pct(data.kpis.cardCount, data.kpis.totalPayments),
                  color: GREEN,
                },
              ]}
            />

            {/* Tableau paiements */}
            <Panel className="overflow-hidden" tint={TEAL}>
              <div className="px-5 pt-5">
                <PanelHeader
                  title={tp.listTitle}
                  subtitle={tp.listSubtitle}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handlePrint}
                        disabled={filtered.length === 0}
                        className={`${TOOL_BUTTON} border border-gray-200 bg-white/90 text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Printer {...ICON} size={16} />
                        {tp.print}
                      </button>
                      <a
                        href={exportUrl}
                        className={`${TOOL_BUTTON} bg-gradient-to-r from-[#F08A3C] to-[#E87722] text-white shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105`}
                      >
                        <Download {...ICON} size={16} />
                        {tp.exportCsv}
                      </a>
                    </div>
                  }
                />
                {/* Filtres */}
                <div className="flex flex-wrap gap-3 pb-4">
                  <div className="relative flex-1 min-w-48">
                    <Search {...ICON} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      placeholder={tp.search}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className={`w-full pl-9 pr-4 ${FILTER_INPUT}`}
                    />
                  </div>
                  <SelectField
                    value={filterStatus}
                    onChange={(v) => {
                      setFilterStatus(v);
                      setPage(1);
                    }}
                    options={[
                      { value: "", label: tp.allStatuses },
                      ...STATUSES.map((s) => ({ value: String(s), label: tp.statuses[s] })),
                    ]}
                    size="sm"
                    className="w-full sm:w-44"
                  />
                  <SelectField
                    value={filterMethod}
                    onChange={(v) => {
                      setFilterMethod(v);
                      setPage(1);
                    }}
                    options={[
                      { value: "", label: tp.allMethods },
                      ...METHODS.map((m) => ({ value: String(m), label: tp.methods[m] })),
                    ]}
                    size="sm"
                    className="w-full sm:w-44"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-y border-gray-200/60 bg-white/60">
                    <tr>
                      <th className={`text-left ${TH}`}>{tp.colUser}</th>
                      <th className={`text-left ${TH}`}>{tp.colAmount}</th>
                      <th className={`text-left ${TH}`}>{tp.colMethod}</th>
                      <th className={`text-left ${TH}`}>{c.status}</th>
                      <th className={`text-left ${TH}`}>{tp.colDate}</th>
                      <th className={`text-left ${TH}`}>{tp.colExpires}</th>
                      <th className={`text-right ${TH}`}>{tp.colInvoice}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {paginated.map((p) => {
                      const hint = expiryHint(p.expiresAt);
                      return (
                        <tr key={p.id} className="hover:bg-white/70 transition-colors">
                          <td className="px-5 py-3">
                            <p className="text-sm text-[#1A1A2E]">{p.user || c.unknownUser}</p>
                            <p className="text-xs text-gray-400">{p.email}</p>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-[#1A1A2E] tabular-nums">{p.amount}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              {methodIcon(p.method)}
                              {tp.methods[p.method] ?? p.method}
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge variant={STATUS_VARIANTS[p.status]}>{tp.statuses[p.status]}</Badge></td>
                          <td className="px-5 py-3 text-gray-500 tabular-nums whitespace-nowrap">{formatDate(p.date)}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <p className="text-gray-700 tabular-nums">{formatDate(p.expiresAt)}</p>
                            {p.status === "ACTIVE" && <p className={`text-xs ${hint.className}`}>{hint.label}</p>}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {p.invoiceUrl ? (
                              <a
                                href={p.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#E87722] text-xs hover:underline"
                              >
                                <FileText {...ICON} size={14} />PDF
                              </a>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <p className="px-5 py-12 text-sm text-gray-400 text-center">
                  {data.payments.length === 0 ? tp.none : tp.noMatch}
                </p>
              )}

              {filtered.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={PAGE_SIZE}
                  totalItems={filtered.length}
                  onPageChange={setPage}
                />
              )}
            </Panel>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
