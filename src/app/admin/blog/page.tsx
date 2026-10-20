"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, FileText, Search, ExternalLink } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  excerpt: string | null;
  excerptEn: string | null;
  content: string;
  contentEn: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
};

const emptyForm = {
  title: "",
  titleEn: "",
  excerpt: "",
  excerptEn: "",
  content: "",
  contentEn: "",
  coverImage: "",
  category: "",
  tags: "",
  author: "",
  isPublished: false,
};

const PAGE_SIZE = 10;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { t, tError } = useI18n();
  const c = t.adminCommon;
  const tb = t.adminBlog;

  const load = () => {
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      titleEn: p.titleEn ?? "",
      excerpt: p.excerpt ?? "",
      excerptEn: p.excerptEn ?? "",
      content: p.content,
      contentEn: p.contentEn ?? "",
      coverImage: p.coverImage ?? "",
      category: p.category,
      tags: p.tags.join(", "),
      author: p.author,
      isPublished: p.isPublished,
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

    if (!form.title.trim() || !form.content.trim() || !form.category.trim() || !form.author.trim()) {
      setError(tb.required);
      return;
    }

    const payload = {
      title: form.title.trim(),
      titleEn: form.titleEn.trim(),
      excerpt: form.excerpt.trim(),
      excerptEn: form.excerptEn.trim(),
      content: form.content.trim(),
      contentEn: form.contentEn.trim(),
      coverImage: form.coverImage.trim(),
      category: form.category.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      author: form.author.trim(),
      isPublished: form.isPublished,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/blog", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(tError(data.error, c.editError));
          return;
        }
        setPosts((prev) => prev.map((item) => (item.id === editingId ? data.post : item)));
        cancelEdit();
      } else {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(tError(data.error, c.addError));
          return;
        }
        setPosts((prev) => [data.post, ...prev]);
        setForm(emptyForm);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (p: BlogPost) => {
    setProcessingId(p.id);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isPublished: !p.isPublished }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => prev.map((item) => (item.id === p.id ? data.post : item)));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const p = deleteTarget;
    setProcessingId(p.id);
    try {
      const res = await fetch(`/api/admin/blog?id=${p.id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((item) => item.id !== p.id));
        if (editingId === p.id) cancelEdit();
      }
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const filtered = posts.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight">{tb.title}</h1>
          <div className="text-sm text-gray-500">{tb.count(filtered.length)}</div>
        </div>
        <Separator />

        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3 flex items-center gap-2">
            {editingId ? <Pencil className="w-4 h-4 text-[#E87722]" /> : <FileText className="w-4 h-4 text-[#E87722]" />}
            {editingId ? tb.editTitle : tb.newTitle}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.titleFr}</label>
                <input
                  type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder={tb.titlePlaceholder}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.titleEn}</label>
                <input
                  type="text" value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Article title"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.category}</label>
                <input
                  type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Guide au pair"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.author}</label>
                <input
                  type="text" value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Équipe AuPair A.EU"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.tags}</label>
                <input
                  type="text" value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="visa, europe, guide"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{tb.coverImage}</label>
              <input
                type="text" value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                placeholder="https://..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.excerptFr}</label>
                <textarea
                  value={form.excerpt} rows={2}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  placeholder={tb.excerptPlaceholder}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.excerptEn}</label>
                <textarea
                  value={form.excerptEn} rows={2}
                  onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  placeholder="Short summary"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.contentFr}</label>
                <textarea
                  value={form.content} rows={6}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder={tb.contentPlaceholder}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{tb.contentEn}</label>
                <textarea
                  value={form.contentEn} rows={6}
                  onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="Full article content"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox" checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#E87722] focus:ring-[#E87722]"
                />
                {tb.publishNow}
              </label>
              <div className="flex items-center gap-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} disabled={submitting}>
                    {c.cancel}
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {editingId ? <><Pencil className="w-4 h-4 mr-1" /> {c.save}</> : <><Plus className="w-4 h-4 mr-1" /> {c.create}</>}
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
            placeholder={tb.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
        </div>

        {/* Tableau */}
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
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{tb.colTitle}</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{tb.category}</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{tb.author}</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{tb.colViews}</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{c.status}</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{c.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">{tb.none}</td>
                    </tr>
                  ) : (
                    paginated.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${editingId === p.id ? "bg-[#FFF3E0]" : ""}`}>
                        <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="px-5 py-3.5 font-medium text-[#1A1A2E] max-w-xs">
                          <span className="line-clamp-1">{p.title}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{p.category}</td>
                        <td className="px-5 py-3.5 text-gray-500">{p.author}</td>
                        <td className="px-5 py-3.5 text-gray-500">{p.views}</td>
                        <td className="px-5 py-3.5">
                          {p.isPublished ? <Badge variant="success">{c.published}</Badge> : <Badge variant="secondary">{c.draft}</Badge>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {p.isPublished && (
                              <a
                                href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                                title={tb.viewArticle}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              disabled={processingId === p.id}
                              onClick={() => startEdit(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                              title={c.edit}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              disabled={processingId === p.id}
                              onClick={() => togglePublish(p)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                              title={p.isPublished ? c.unpublish : c.publish}
                            >
                              {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              disabled={processingId === p.id}
                              onClick={() => setDeleteTarget(p)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
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

      {deleteTarget && (
        <ConfirmDialog
          title={tb.deleteTitle}
          description={
            <>
              <span className="font-medium text-[#1A1A2E]">{deleteTarget.title}</span> {c.willBeDeleted} {c.irreversible}
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
