"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Smartphone, Globe, Download, Loader2, FileText } from "lucide-react";

type Payment = {
  id: string;
  user: string;
  email: string;
  amount: string;
  method: "MOBILE_MONEY" | "CARD" | "PAYPAL";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  date: string;
  invoiceUrl: string | null;
};

const PAGE_SIZE = 10;

type PaymentsData = {
  kpis: {
    revenueActiveEur: string;
    revenueActiveXof: string | null;
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

const methodLabel = (method: Payment["method"]) => {
  if (method === "MOBILE_MONEY") return "Mobile Money";
  if (method === "CARD") return "Carte bancaire";
  return "PayPal";
};

const statusBadge = (status: Payment["status"]) => {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Actif</Badge>;
    case "EXPIRED":
      return <Badge variant="secondary">Expiré</Badge>;
    case "CANCELLED":
      return <Badge variant="warning">Annulé</Badge>;
    case "REFUNDED":
      return <Badge variant="destructive">Remboursé</Badge>;
  }
};

export default function PaiementsPage() {
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paiements</h1>
          <a
            href="/api/admin/payments/export"
            className="flex items-center gap-2 bg-[#1A1A2E] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#2a2a3e] transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </a>
        </div>

        {loading || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
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
                    <p className="text-2xl font-extrabold text-[#1A1A2E]">{data.kpis.revenueActiveEur}</p>
                    {data.kpis.revenueActiveXof && (
                      <p className="text-xs text-gray-400">+ {data.kpis.revenueActiveXof}</p>
                    )}
                    <p className="text-xs text-gray-500">Revenus actifs</p>
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
                    <p className="text-xs text-gray-500">Abonnements actifs</p>
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
                    <p className="text-xs text-gray-500">Via Mobile Money</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau paiements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Méthode</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Facture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1A1A2E]">{p.user}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-[#E87722]">{p.amount}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          {methodIcon(p.method)}
                          {methodLabel(p.method)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(p.status)}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{p.date}</td>
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
                  <p className="text-gray-400">Aucun paiement enregistré.</p>
                </div>
              )}

              {data.payments.length > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, data.payments.length)} sur{" "}
                    {data.payments.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#E87722] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-[#E87722] text-white" : "border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#E87722] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
