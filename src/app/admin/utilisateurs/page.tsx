"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Eye, EyeOff, Trash2, Mail, Loader2 } from "lucide-react";
import ProfileDetailModal from "@/components/admin/ProfileDetailModal";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "AU_PAIR" | "FAMILLE";
  country: string;
  status: string;
  subscribed: boolean;
  createdAt: string;
};

type Action = "validate" | "hide" | "unhide" | "suspend" | "delete";

export default function UtilisateursPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<{ userId: string; role: "AU_PAIR" | "FAMILLE" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (u: AdminUser, action: Action) => {
    if (action === "delete" && !confirm(`Supprimer le compte de ${u.name} ?`)) return;

    setProcessingId(u.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: u.role, action }),
      });
      if (res.ok) {
        const status = { validate: "ACTIVE", hide: "HIDDEN", unhide: "ACTIVE", suspend: "SUSPENDED", delete: "DELETED" }[action];
        if (action === "delete") {
          setUsers((prev) => prev.filter((item) => item.id !== u.id));
        } else {
          setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, status } : item)));
        }
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return <Badge variant="success">Actif</Badge>;
    if (s === "PENDING") return <Badge variant="warning">En attente</Badge>;
    if (s === "SUSPENDED") return <Badge variant="destructive">Suspendu</Badge>;
    if (s === "HIDDEN") return <Badge variant="secondary">Masqué</Badge>;
    if (s === "DELETED") return <Badge variant="destructive">Supprimé</Badge>;
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
            <option value="HIDDEN">Masqué</option>
            <option value="SUSPENDED">Suspendu</option>
            <option value="DELETED">Supprimé</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
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
                      <button onClick={() => setViewing({ userId: u.id, role: u.role })}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir profil">
                        <Eye className="w-4 h-4" />
                      </button>
                      {u.status === "PENDING" && (
                        <button disabled={processingId === u.id} onClick={() => handleAction(u, "validate")}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50" title="Valider">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {u.status === "HIDDEN" ? (
                        <button disabled={processingId === u.id} onClick={() => handleAction(u, "unhide")}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" title="Démasquer">
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button disabled={processingId === u.id} onClick={() => handleAction(u, "hide")}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" title="Masquer">
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Envoyer email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button disabled={processingId === u.id} onClick={() => handleAction(u, "delete")}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {viewing && (
        <ProfileDetailModal userId={viewing.userId} role={viewing.role} onClose={() => setViewing(null)} />
      )}
    </AdminLayout>
  );
}
