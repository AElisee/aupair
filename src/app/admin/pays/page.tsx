"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  X,
  AlertTriangle,
  Search,
} from "lucide-react";

type Country = {
  id: string;
  name: string;
  flag: string;
  dialCode: string;
  type: "ORIGIN" | "HOST";
  isActive: boolean;
};

const emptyForm = {
  name: "",
  flag: "",
  dialCode: "",
  type: "ORIGIN" as "ORIGIN" | "HOST",
};

const PAGE_SIZE = 10;

const formatCountryName = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

// Les drapeaux sont générés à partir d'un code ISO à 2 lettres pour garantir
// un rendu uniforme (deux symboles indicateurs régionaux Unicode).
const REGIONAL_INDICATOR_OFFSET = "🇦".codePointAt(0)! - "A".charCodeAt(0);

const isoToFlag = (iso: string): string => {
  const code = iso.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return code;
  return [...code]
    .map((c) =>
      String.fromCodePoint(c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
    )
    .join("");
};

const flagToIso = (flag: string): string => {
  const points = [...flag].map((c) => c.codePointAt(0) ?? 0);
  if (
    points.length === 2 &&
    points.every((p) => p >= 0x1f1e6 && p <= 0x1f1ff)
  ) {
    return points
      .map((p) => String.fromCharCode(p - REGIONAL_INDICATOR_OFFSET))
      .join("");
  }
  return flag;
};

export default function AdminPaysPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"" | "ORIGIN" | "HOST">("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data.countries ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c: Country) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      flag: flagToIso(c.flag),
      dialCode: c.dialCode,
      type: c.type,
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.flag.trim() || !form.dialCode.trim()) {
      setError("Tous les champs sont requis.");
      return;
    }

    if (!/^[A-Za-z]{2}$/.test(form.flag.trim())) {
      setError("Le code pays doit être composé de 2 lettres (ex : FR, TN).");
      return;
    }

    const payload = {
      ...form,
      name: formatCountryName(form.name.trim()),
      flag: isoToFlag(form.flag),
      dialCode: form.dialCode.trim(),
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/countries", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur lors de la modification.");
          return;
        }
        setCountries((prev) =>
          prev.map((item) => (item.id === editingId ? data.country : item)),
        );
        cancelEdit();
      } else {
        const res = await fetch("/api/admin/countries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur lors de l'ajout.");
          return;
        }
        setCountries((prev) => [...prev, data.country]);
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (c: Country) => {
    setProcessingId(c.id);
    try {
      const res = await fetch("/api/admin/countries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, isActive: !c.isActive }),
      });
      if (res.ok) {
        setCountries((prev) =>
          prev.map((item) =>
            item.id === c.id ? { ...item, isActive: !item.isActive } : item,
          ),
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const c = deleteTarget;

    setProcessingId(c.id);
    try {
      const res = await fetch(`/api/admin/countries?id=${c.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCountries((prev) => prev.filter((item) => item.id !== c.id));
        if (editingId === c.id) cancelEdit();
      }
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const filtered = countries.filter((c) => {
    const matchType = !filterType || c.type === filterType;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q);
    return matchType && matchSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const changeFilter = (type: "" | "ORIGIN" | "HOST") => {
    setFilterType(type);
    setPage(1);
  };

  const allPageSelected =
    paginated.length > 0 && paginated.every((c) => selected.has(c.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginated.forEach((c) => next.delete(c.id));
      } else {
        paginated.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Pays</h1>
          <div className="text-sm text-gray-500">{filtered.length} pays</div>
        </div>

        {/* Formulaire d'ajout / modification */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
            {editingId ? (
              <Pencil className="w-4 h-4 text-[#E87722]" />
            ) : (
              <Globe className="w-4 h-4 text-[#E87722]" />
            )}
            {editingId ? "Modifier le pays" : "Ajouter un pays"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Code pays (ISO)
              </label>
              <input
                type="text"
                value={form.flag}
                onChange={(e) =>
                  setForm({ ...form, flag: e.target.value.toUpperCase() })
                }
                placeholder="FR"
                maxLength={2}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Nom du pays
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="France"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Indicatif
              </label>
              <input
                type="text"
                value={form.dialCode}
                onChange={(e) => setForm({ ...form, dialCode: e.target.value })}
                placeholder="+33"
                className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "ORIGIN" | "HOST",
                  })
                }
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
              >
                <option value="ORIGIN">Pays d'origine</option>
                <option value="HOST">Pays d'accueil</option>
              </select>
            </div>
            <Button type="submit" disabled={submitting}>
              {editingId ? (
                <>
                  <Pencil className="w-4 h-4 mr-1" /> Enregistrer
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </>
              )}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={submitting}
              >
                Annuler
              </Button>
            )}
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => changeFilter("")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === "" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              Tous
            </button>
            <button
              onClick={() => changeFilter("ORIGIN")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === "ORIGIN" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              Origine
            </button>
            <button
              onClick={() => changeFilter("HOST")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterType === "HOST" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              Accueil
            </button>
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un pays ou un indicatif..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
          </div>
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
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#E87722] focus:ring-[#E87722]"
                    />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Drapeau
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Indicatif
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-gray-400"
                    >
                      Aucun pays.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 transition-colors ${editingId === c.id ? "bg-[#FFF3E0]" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggleSelectOne(c.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#E87722] focus:ring-[#E87722]"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-md leading-none">
                        {c.flag}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#1A1A2E]">
                        {formatCountryName(c.name)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {c.dialCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            c.type === "ORIGIN" ? "default" : "secondary"
                          }
                        >
                          {c.type === "ORIGIN" ? "Origine" : "Accueil"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.isActive ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            disabled={processingId === c.id}
                            onClick={() => startEdit(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            disabled={processingId === c.id}
                            onClick={() => toggleActive(c)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title={c.isActive ? "Désactiver" : "Activer"}
                          >
                            {c.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            disabled={processingId === c.id}
                            onClick={() => setDeleteTarget(c)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} sur{" "}
                {filtered.length}
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
      </div>

      {/* Modale de confirmation de suppression */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1A1A2E]">
                  Supprimer ce pays ?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-[#1A1A2E]">
                    {deleteTarget.flag} {deleteTarget.name}
                  </span>{" "}
                  sera définitivement supprimé. Cette action est irréversible.
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={processingId === deleteTarget.id}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={processingId === deleteTarget.id}
              >
                {processingId === deleteTarget.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
