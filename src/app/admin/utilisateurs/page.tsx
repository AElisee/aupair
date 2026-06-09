"use client";
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, EyeOff, Trash2, Mail } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Aminata Koné", email: "aminata@email.com", role: "AU_PAIR", country: "Cameroun", status: "PENDING", subscribed: true, createdAt: "2026-03-05" },
  { id: "2", name: "Famille Martin", email: "martin@email.com", role: "FAMILLE", country: "France", status: "ACTIVE", subscribed: false, createdAt: "2026-03-04" },
  { id: "3", name: "Kofi Mensah", email: "kofi@email.com", role: "AU_PAIR", country: "Ghana", status: "PENDING", subscribed: true, createdAt: "2026-03-04" },
  { id: "4", name: "Fatou Sow", email: "fatou@email.com", role: "AU_PAIR", country: "Sénégal", status: "ACTIVE", subscribed: true, createdAt: "2026-03-03" },
  { id: "5", name: "Famille Becker", email: "becker@email.com", role: "FAMILLE", country: "Allemagne", status: "ACTIVE", subscribed: false, createdAt: "2026-03-02" },
  { id: "6", name: "Ibrahim Diallo", email: "ibrahim@email.com", role: "AU_PAIR", country: "Mali", status: "SUSPENDED", subscribed: false, createdAt: "2026-03-01" },
];

export default function UtilisateursPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return <Badge variant="success">Actif</Badge>;
    if (s === "PENDING") return <Badge variant="warning">En attente</Badge>;
    if (s === "SUSPENDED") return <Badge variant="destructive">Suspendu</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Utilisateurs</h1>
          <div className="text-sm text-gray-500">{filtered.length} utilisateur(s)</div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
            <option value="">Tous les rôles</option>
            <option value="AU_PAIR">Au pair</option>
            <option value="FAMILLE">Famille</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="PENDING">En attente</option>
            <option value="SUSPENDED">Suspendu</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Abonnement</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A2E]">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.role === "AU_PAIR" ? "default" : "secondary"}>
                      {u.role === "AU_PAIR" ? "Au pair" : "Famille"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(u.status)}</td>
                  <td className="px-5 py-3.5">
                    {u.subscribed
                      ? <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Actif</span>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{u.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {u.status === "PENDING" && (
                        <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Valider">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Masquer">
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Envoyer email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
