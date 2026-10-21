"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { PAGE_TITLE } from "@/components/admin/AdminUI";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Star, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n";

type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  authorCountry: string;
  content: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
};

type Filter = "all" | "pending" | "published";

const PAGE_SIZE = 10;

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const { t, tValue, relativeDate } = useI18n();
  const c = t.adminCommon;
  const ta = t.adminTestimonials;
  const roles = t.home.testimonials.roles;

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (item: Testimonial) => {
    setProcessingId(item.id);
    try {
      const res = await fetch("/api/admin/testimonials", {
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
      const res = await fetch(`/api/admin/testimonials?id=${item.id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setProcessingId(null);
      setDeleteTarget(null);
    }
  };

  const pendingCount = items.filter((i) => !i.isPublished).length;
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: ta.filterAll, count: items.length },
    { key: "pending", label: ta.filterPending, count: pendingCount },
    { key: "published", label: ta.filterPublished, count: items.length - pendingCount },
  ];

  const filtered = items.filter((i) =>
    filter === "all" ? true : filter === "pending" ? !i.isPublished : i.isPublished
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className={PAGE_TITLE}>{ta.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{ta.subtitle}</p>
          </div>
          <div className="text-sm text-gray-500 shrink-0">{ta.count(filtered.length)}</div>
        </div>
        <Separator />

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                filter === f.key
                  ? "bg-[#E87722] border-[#E87722] text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-[#E87722]"
              }`}
            >
              {f.label} <span className="tabular-nums opacity-75">({f.count})</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </div>
          ) : paginated.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400">{ta.none}</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paginated.map((item) => (
                <li key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                      <span className="font-medium text-[#1A1A2E]">{item.authorName}</span>
                      <span className="text-xs text-gray-400">
                        {roles[item.authorRole as keyof typeof roles] ?? roles.AUTRE}
                        {item.authorCountry && ` · ${tValue(item.authorCountry)}`}
                        {" · "}
                        {relativeDate(item.createdAt)}
                      </span>
                      {item.isPublished ? <Badge variant="success">{ta.published}</Badge> : <Badge variant="warning">{ta.pending}</Badge>}
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? "fill-[#E87722] text-[#E87722]" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line break-words">{item.content}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-1 shrink-0">
                    <button
                      disabled={processingId === item.id}
                      onClick={() => togglePublish(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl transition-colors disabled:opacity-50 ${
                        item.isPublished ? "text-gray-500 hover:bg-gray-100" : "text-green-700 bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {item.isPublished ? c.hide : c.publish}
                    </button>
                    <button
                      disabled={processingId === item.id}
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> {c.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
          title={ta.deleteTitle}
          description={
            <>
              <span className="font-medium text-[#1A1A2E]">{ta.reviewBy(deleteTarget.authorName)}</span> {ta.willBeDeleted} {c.irreversible}
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
