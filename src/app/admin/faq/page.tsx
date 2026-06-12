"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, HelpCircle, Search } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type FaqItem = {
  id: string;
  question: string;
  questionEn: string | null;
  answer: string;
  answerEn: string | null;
  category: string;
  order: number;
  isPublished: boolean;
};

const emptyForm = {
  question: "",
  questionEn: "",
  answer: "",
  answerEn: "",
  category: "",
  order: 0,
  isPublished: true,
};

const PAGE_SIZE = 10;

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/admin/faq")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      questionEn: item.questionEn ?? "",
      answer: item.answer,
      answerEn: item.answerEn ?? "",
      category: item.category,
      order: item.order,
      isPublished: item.isPublished,
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

    if (!form.question.trim() || !form.answer.trim() || !form.category.trim()) {
      setError("Question, réponse et catégorie sont obligatoires.");
      return;
    }

    const payload = {
      question: form.question.trim(),
      questionEn: form.questionEn.trim(),
      answer: form.answer.trim(),
      answerEn: form.answerEn.trim(),
      category: form.category.trim(),
      order: form.order,
      isPublished: form.isPublished,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/faq", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur lors de la modification.");
          return;
        }
        setItems((prev) => prev.map((i) => (i.id === editingId ? data.item : i)));
        cancelEdit();
      } else {
        const res = await fetch("/api/admin/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur lors de l'ajout.");
          return;
        }
        setItems((prev) => [...prev, data.item]);
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (item: FaqItem) => {
    setProcessingId(item.id);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const item = deleteTarget;
    setProcessingId(item.id);
    try {
      const res = await fetch(`/api/admin/faq?id=${item.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        if (editingId === item.id) cancelEdit();
      }
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.question.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">FAQ</h1>
          <div className="text-sm text-gray-500">{filtered.length} question(s)</div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4 text-[#E87722]" /> : <HelpCircle className="w-4 h-4 text-[#E87722]" />}
            {editingId ? "Modifier la question" : "Nouvelle question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Question (FR)</label>
                <input
                  type="text" value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Comment fonctionne..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Question (EN)</label>
                <input
                  type="text" value={form.questionEn}
                  onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="How does it work..."
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Réponse (FR)</label>
                <textarea
                  value={form.answer} rows={3}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  placeholder="Réponse complète"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Réponse (EN)</label>
                <textarea
                  value={form.answerEn} rows={3}
                  onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  placeholder="Full answer"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                <input
                  type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Au pairs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ordre</label>
                <input
                  type="number" value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                  className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer h-10">
                <input
                  type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#E87722] focus:ring-[#E87722]"
                />
                Publiée
              </label>
              <div className="ml-auto flex items-center gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} disabled={submitting}>
                    Annuler
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {editingId ? <><Pencil className="w-4 h-4 mr-1" /> Enregistrer</> : <><Plus className="w-4 h-4 mr-1" /> Ajouter</>}
                </Button>
              </div>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Recherche */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une question..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ordre</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Aucune question.</td>
                    </tr>
                  ) : (
                    paginated.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editingId === item.id ? "bg-[#FFF3E0]" : ""}`}>
                        <td className="px-5 py-3.5 font-semibold text-[#1A1A2E] max-w-md">
                          <span className="line-clamp-1">{item.question}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="secondary">{item.category}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{item.order}</td>
                        <td className="px-5 py-3.5">
                          {item.isPublished ? <Badge variant="success">Publiée</Badge> : <Badge variant="warning">Masquée</Badge>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              disabled={processingId === item.id}
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              disabled={processingId === item.id}
                              onClick={() => togglePublish(item)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title={item.isPublished ? "Masquer" : "Publier"}
                            >
                              {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              disabled={processingId === item.id}
                              onClick={() => setDeleteTarget(item)}
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
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#E87722] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-[#E87722] text-white" : "border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
                  >
                    {p}
                  </button>
                ))}
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

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer cette question ?"
          description={
            <>
              <span className="font-semibold text-[#1A1A2E]">{deleteTarget.question}</span> sera définitivement supprimée. Cette action est irréversible.
            </>
          }
          confirmLabel="Supprimer"
          loading={processingId === deleteTarget.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
