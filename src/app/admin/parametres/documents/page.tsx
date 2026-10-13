"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, FileCheck, Save, ExternalLink, CheckCircle } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useI18n } from "@/i18n";
import { SUGGESTED_DOCUMENTS, getDocumentPublicPath, normalizeDocumentSlug, toDocumentHtml } from "@/lib/legal-documents";

type LegalDocument = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  isPublished: boolean;
  updatedAt: string;
};

const emptyForm = {
  slug: "",
  title: "",
  titleEn: "",
  content: "",
  contentEn: "",
  isPublished: false,
};

const inputClass =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]";

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [contentLang, setContentLang] = useState<"fr" | "en">("fr");
  // Incrémenté à chaque ouverture pour recharger le contenu dans l'éditeur (non contrôlé).
  const [editorKey, setEditorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LegalDocument | null>(null);
  const { t, lang, locale, tError } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  useEffect(() => {
    fetch("/api/admin/documents")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const openNew = (preset?: { slug: string; title: string; titleEn: string }) => {
    setEditingId(null);
    setForm(preset ? { ...emptyForm, ...preset } : emptyForm);
    setEditorOpen(true);
    setContentLang("fr");
    setEditorKey((k) => k + 1);
    setError("");
    setSaved(false);
  };

  const startEdit = (item: LegalDocument) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      title: item.title,
      titleEn: item.titleEn ?? "",
      content: toDocumentHtml(item.content),
      contentEn: toDocumentHtml(item.contentEn ?? ""),
      isPublished: item.isPublished,
    });
    setEditorOpen(true);
    setContentLang("fr");
    setEditorKey((k) => k + 1);
    setError("");
    setSaved(false);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    const slug = normalizeDocumentSlug(form.slug);
    if (!slug || !form.title.trim() || !form.content) {
      setError(ts.documentsRequired);
      return;
    }

    const payload = {
      slug,
      title: form.title.trim(),
      titleEn: form.titleEn.trim(),
      content: form.content,
      contentEn: form.contentEn,
      isPublished: form.isPublished,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.saveError));
        return;
      }
      setItems((prev) =>
        editingId ? prev.map((i) => (i.id === editingId ? data.item : i)) : [...prev, data.item]
      );
      setEditingId(data.item.id);
      setForm((f) => ({ ...f, slug: data.item.slug }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(c.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (item: LegalDocument) => {
    setProcessingId(item.id);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
        if (editingId === item.id) setForm((f) => ({ ...f, isPublished: data.item.isPublished }));
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
      const res = await fetch(`/api/admin/documents?id=${item.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        if (editingId === item.id) closeEditor();
      }
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const missingSuggestions = SUGGESTED_DOCUMENTS.filter((s) => !items.some((i) => i.slug === s.slug));
  const contentKey = contentLang === "fr" ? "content" : "contentEn";
  const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title, "fr"));

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{ts.documentsTitle}</h1>
            <p className="text-sm text-gray-500">{ts.documentsSubtitle}</p>
          </div>
          <Button onClick={() => openNew()}>
            <Plus className="w-4 h-4 mr-1" /> {ts.newDocument}
          </Button>
        </div>

        {!loading && missingSuggestions.length > 0 && (
          <div className="bg-[#FFF3E0] rounded-2xl p-4 text-sm text-[#1A1A2E] flex flex-wrap items-center gap-2">
            <span>{ts.missingDocuments}</span>
            {missingSuggestions.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => openNew(s)}
                className="px-3 py-1 rounded-full bg-white border border-[#E87722] text-[#E87722] font-semibold hover:bg-[#E87722] hover:text-white transition-colors"
              >
                + {lang === "en" ? s.titleEn : s.title}
              </button>
            ))}
          </div>
        )}

        {/* Liste */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{ts.colDocument}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{ts.colPublicUrl}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{ts.colUpdated}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.status}</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{c.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">{ts.noDocuments}</td>
                    </tr>
                  ) : (
                    sortedItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editingId === item.id ? "bg-[#FFF3E0]" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-[#1A1A2E]">{item.title}</div>
                          {!item.contentEn && <div className="text-xs text-gray-400">{ts.noEnglish}</div>}
                        </td>
                        <td className="px-5 py-3.5">
                          <a
                            href={getDocumentPublicPath(item.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E87722] hover:underline inline-flex items-center gap-1 font-mono text-xs"
                          >
                            {getDocumentPublicPath(item.slug)} <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {new Date(item.updatedAt).toLocaleDateString(locale)}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.isPublished ? <Badge variant="success">{c.published}</Badge> : <Badge variant="warning">{c.draft}</Badge>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              disabled={processingId === item.id}
                              onClick={() => startEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title={c.edit}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              disabled={processingId === item.id}
                              onClick={() => togglePublish(item)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title={item.isPublished ? c.unpublish : c.publish}
                            >
                              {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              disabled={processingId === item.id}
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={c.delete}
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
        </div>

        {/* Éditeur */}
        {editorOpen && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              {editingId ? <Pencil className="w-4 h-4 text-[#E87722]" /> : <FileCheck className="w-4 h-4 text-[#E87722]" />}
              {editingId ? ts.editDocument : ts.newDocument}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{ts.slug}</label>
                  <input
                    type="text" value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    onBlur={() => setForm((f) => ({ ...f, slug: normalizeDocumentSlug(f.slug) }))}
                    className={`${inputClass} font-mono`}
                    placeholder="cgu"
                  />
                  {form.slug && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">{getDocumentPublicPath(normalizeDocumentSlug(form.slug))}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{ts.titleFr}</label>
                  <input
                    type="text" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder={ts.titleFrPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{ts.titleEn}</label>
                  <input
                    type="text" value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className={inputClass}
                    placeholder="Terms of use"
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex gap-1">
                    {(["fr", "en"] as const).map((l) => (
                      <button
                        key={l} type="button"
                        onClick={() => setContentLang(l)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          contentLang === l ? "bg-[#E87722] text-white" : "border border-gray-200 text-gray-600 hover:border-[#E87722]"
                        }`}
                      >
                        {ts.contentTab(l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
                <RichTextEditor
                  key={`${editorKey}-${contentLang}`}
                  value={form[contentKey]}
                  onChange={(html) => setForm((f) => ({ ...f, [contentKey]: html }))}
                  placeholder={contentLang === "fr" ? "Article 1 — Objet…" : "Article 1 — Purpose…"}
                />
                {contentLang === "en" && (
                  <p className="text-xs text-gray-400 mt-1">{ts.englishFallbackHint}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox" checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#E87722] focus:ring-[#E87722]"
                  />
                  {ts.publishedVisible}
                </label>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {saved && (
                  <p className="text-green-600 text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> {ts.documentSaved}
                  </p>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={closeEditor} disabled={submitting}>
                    {c.close}
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    {c.save}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={ts.deleteDocumentTitle}
          description={
            <>
              <span className="font-semibold text-[#1A1A2E]">{deleteTarget.title}</span> {ts.deleteDocumentText} {c.irreversible}
            </>
          }
          confirmLabel={c.delete}
          loading={processingId === deleteTarget.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
