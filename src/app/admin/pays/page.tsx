"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
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
  Search,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { SelectField } from "@/components/ui/select-field";

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
  const { t, tError } = useI18n();
  const ac = t.adminCommon;
  const tc = t.adminCountries;

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
      setError(tc.allFieldsRequired);
      return;
    }

    if (!/^[A-Za-z]{2}$/.test(form.flag.trim())) {
      setError(tc.invalidIso);
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
          setError(tError(data.error, ac.editError));
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
          setError(tError(data.error, ac.addError));
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
          <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight">{tc.title}</h1>
          <div className="text-sm text-gray-500">{tc.count(filtered.length)}</div>
        </div>
        <Separator />

        {/* Formulaire d'ajout / modification */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3 flex items-center gap-2">
            {editingId ? (
              <Pencil className="w-4 h-4 text-[#E87722]" />
            ) : (
              <Globe className="w-4 h-4 text-[#E87722]" />
            )}
            {editingId ? tc.editTitle : tc.addTitle}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {tc.isoCode}
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
                {tc.name}
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
                {tc.dialCode}
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
                {tc.type}
              </label>
              <SelectField
                value={form.type}
                onChange={(v) =>
                  setForm({
                    ...form,
                    type: v as "ORIGIN" | "HOST",
                  })}
                options={[
                  { value: "ORIGIN", label: tc.originCountry },
                  { value: "HOST", label: tc.hostCountry },
                ]}
                size="sm"
                className="w-44"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {editingId ? (
                <>
                  <Pencil className="w-4 h-4 mr-1" /> {ac.save}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" /> {ac.add}
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
                {ac.cancel}
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
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filterType === "" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              {ac.all}
            </button>
            <button
              onClick={() => changeFilter("ORIGIN")}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filterType === "ORIGIN" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              {tc.origin}
            </button>
            <button
              onClick={() => changeFilter("HOST")}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filterType === "HOST" ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              {tc.host}
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
              placeholder={tc.searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{ac.loading}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tc.colFlag}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tc.colName}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tc.dialCode}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tc.type}
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {ac.status}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {ac.actions}
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
                      {tc.none}
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
                      <td className="px-5 py-3.5 font-medium text-[#1A1A2E]">
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
                          {c.type === "ORIGIN" ? tc.origin : tc.host}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.isActive ? (
                          <Badge variant="success">{t.adminCommon.active}</Badge>
                        ) : (
                          <Badge variant="secondary">{t.adminCommon.inactive}</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            disabled={processingId === c.id}
                            onClick={() => startEdit(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                            title={t.adminCommon.edit}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            disabled={processingId === c.id}
                            onClick={() => toggleActive(c)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                            title={c.isActive ? tc.deactivate : tc.activate}
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
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                            title={t.adminCommon.delete}
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
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {deleteTarget && (
        <ConfirmDialog
          title={tc.deleteTitle}
          description={
            <>
              <span className="font-medium text-[#1A1A2E]">
                {deleteTarget.flag} {deleteTarget.name}
              </span>{" "}
              {t.adminCommon.willBeDeleted} {t.adminCommon.irreversible}
            </>
          }
          confirmLabel={t.adminCommon.delete}
          loading={processingId === deleteTarget.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
