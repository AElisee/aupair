"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CreditCard, Smartphone, Globe, Download } from "lucide-react";

const payments = [
  { id: "1", user: "Aminata K.", amount: "32€", amountXof: "20 800 FCFA", method: "Mobile Money", status: "ACTIVE", date: "2026-03-08 14:30" },
  { id: "2", user: "Kofi M.", amount: "32€", amountXof: "20 800 FCFA", method: "Mobile Money", status: "ACTIVE", date: "2026-03-08 10:12" },
  { id: "3", user: "Fatou S.", amount: "32€", amountXof: "", method: "Stripe", status: "ACTIVE", date: "2026-03-07 18:45" },
  { id: "4", user: "Ibrahim D.", amount: "32€", amountXof: "", method: "PayPal", status: "EXPIRED", date: "2026-02-07 09:00" },
  { id: "5", user: "Bénédicte T.", amount: "32€", amountXof: "20 800 FCFA", method: "Mobile Money", status: "ACTIVE", date: "2026-03-06 11:20" },
];

const methodIcon = (method: string) => {
  if (method === "Mobile Money") return <Smartphone className="w-3.5 h-3.5" />;
  if (method === "Stripe") return <CreditCard className="w-3.5 h-3.5" />;
  return <Globe className="w-3.5 h-3.5" />;
};

export default function PaiementsPage() {
  const total = payments.filter(p => p.status === "ACTIVE").length * 32;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paiements</h1>
          <button className="flex items-center gap-2 bg-[#1A1A2E] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#2a2a3e] transition-colors">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>

        {/* KPIs financiers */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#FFF3E0] rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#E87722]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#1A1A2E]">{total}€</p>
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
                <p className="text-2xl font-extrabold text-[#1A1A2E]">{payments.filter(p => p.status === "ACTIVE").length}</p>
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
                <p className="text-2xl font-extrabold text-[#1A1A2E]">{payments.filter(p => p.method === "Mobile Money").length}</p>
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
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">{p.user}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-[#E87722]">{p.amount}</span>
                    {p.amountXof && <span className="text-xs text-gray-400 ml-1">= {p.amountXof}</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {methodIcon(p.method)}
                      {p.method}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>
                      {p.status === "ACTIVE" ? "Actif" : "Expiré"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{p.date}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-[#E87722] text-xs hover:underline font-semibold">
                      <Download className="w-3.5 h-3.5 inline mr-1" />PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
