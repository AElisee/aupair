"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Smartphone, Globe, Download, Loader2, FileText } from "lucide-react";
import { useI18n } from "@/i18n";

type Payment = {
  id: string;
  user: string;
  email: string;
  amount: string;
  method: "MOBILE_MONEY" | "CARD" | "FEDAPAY" | "GENIUSPAY";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  date: string;
  invoiceUrl: string | null;
};

const PAGE_SIZE = 10;

type PaymentsData = {
  kpis: {
    revenueActiveXof: string;
    revenueActiveEur: string | null;
    activeSubscriptions: number;
    mobileMoneyCount: number;
  };
  payments: Payment[];
};

const methodIcon = (method: Payment["method"]) => {
  if (method === "MOBILE_MONEY") return <Smartphone className="w-3.5 h-3.5" />;
  if (method === "CARD") return <CreditCard className="w-3.5 h-3.5" />;
  return <Globe className="w-3.5 h-3.5" />;
};

const STATUS_VARIANTS: Record<Payment["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  EXPIRED: "secondary",
  CANCELLED: "warning",
  REFUNDED: "destructive",
};

export default function PaiementsPage() {
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t, locale } = useI18n();
  const c = t.adminCommon;
  const tp = t.adminPayments;

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil((data?.payments.length ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = data?.payments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  ) ?? [];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{tp.title}</h1>
          <a
            href="/api/admin/payments/export"
            className="flex items-center gap-2 bg-[#1A1A2E] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#2a2a3e] transition-colors"
          >
            <Download className="w-4 h-4" />
            {tp.exportCsv}
          </a>
        </div>

        {loading || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </div>
        ) : (
          <>
            {/* KPIs financiers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#E87722]" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#1A1A2E]">{data.kpis.revenueActiveXof}</p>
                    {data.kpis.revenueActiveEur && (
                      <p className="text-xs text-gray-400">+ {data.kpis.revenueActiveEur}</p>
                    )}
                    <p className="text-xs text-gray-500">{tp.activeRevenue}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#1A1A2E]">{data.kpis.activeSubscriptions}</p>
                    <p className="text-xs text-gray-500">{tp.activeSubscriptions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#1A1A2E]">{data.kpis.mobileMoneyCount}</p>
                    <p className="text-xs text-gray-500">{tp.viaMobileMoney}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau paiements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{tp.colUser}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{tp.colAmount}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{tp.colMethod}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{c.status}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{tp.colDate}</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{tp.colInvoice}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1A1A2E]">{p.user || c.unknownUser}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[#E87722]">{p.amount}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          {methodIcon(p.method)}
                          {tp.methods[p.method] ?? p.method}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANTS[p.status]}>{tp.statuses[p.status]}</Badge></td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(p.date).toLocaleDateString(locale)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E87722] text-xs hover:underline font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5 inline mr-1" />PDF
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.payments.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-gray-400">{tp.none}</p>
                </div>
              )}

              {data.payments.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={PAGE_SIZE}
                  totalItems={data.payments.length}
                  onPageChange={setPage}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
