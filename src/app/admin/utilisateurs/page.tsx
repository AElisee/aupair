"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/layout/AdminLayout";
import Pagination from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  Mail,
  Loader2,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useI18n } from "@/i18n";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "AU_PAIR" | "FAMILLE";
  country: string;
  status: string;
  subscribed: boolean;
  createdAt: string;
  photoUrl: string;
};

type Action = "validate" | "hide" | "unhide" | "suspend" | "delete" | "restore" | "purge";

const PAGE_SIZE = 10;

export default function UtilisateursPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const { t, locale } = useI18n();
  const c = t.adminCommon;
  const tu = t.adminUsers;

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  const performAction = async (u: AdminUser, action: Action) => {
    setProcessingId(u.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: u.role, action }),
      });
      if (res.ok) {
        if (action === "purge") {
          setUsers((prev) => prev.filter((item) => item.id !== u.id));
          return;
        }
        if (action === "restore") {
          const data = await res.json();
          setUsers((prev) =>
            prev.map((item) => (item.id === u.id ? { ...item, status: data.status } : item)),
          );
          return;
        }
        const status = {
          validate: "ACTIVE",
          hide: "HIDDEN",
          unhide: "ACTIVE",
          suspend: "SUSPENDED",
          delete: "DELETED",
        }[action];
        setUsers((prev) =>
          prev.map((item) => (item.id === u.id ? { ...item, status } : item)),
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = (u: AdminUser, action: Action) => {
    if (action === "delete") {
      setDeleteTarget(u);
      return;
    }
    if (action === "purge") {
      setPurgeTarget(u);
      return;
    }
    performAction(u, action);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await performAction(deleteTarget, "delete");
    setDeleteTarget(null);
  };

  const confirmPurge = async () => {
    if (!purgeTarget) return;
    await performAction(purgeTarget, "purge");
    setPurgeTarget(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;

    if (view === "trash") {
      return u.status === "DELETED" && matchSearch && matchRole;
    }
    if (u.status === "DELETED") return false;

    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const trashCount = users.filter((u) => u.status === "DELETED").length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return <Badge variant="success">{c.profileStatus.ACTIVE}</Badge>;
    if (s === "PENDING") return <Badge variant="warning">{c.profileStatus.PENDING}</Badge>;
    if (s === "SUSPENDED") return <Badge variant="destructive">{c.profileStatus.SUSPENDED}</Badge>;
    if (s === "HIDDEN") return <Badge variant="secondary">{c.profileStatus.HIDDEN}</Badge>;
    if (s === "DELETED") return <Badge variant="destructive">{c.profileStatus.DELETED}</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{tu.title}</h1>
          <div className="text-sm text-gray-500">{tu.count(filtered.length)}</div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              view === "active" ? "bg-[#1A1A2E] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-[#E87722]"
            }`}
          >
            {tu.tabUsers}
          </button>
          <button
            onClick={() => {
              setView("trash");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              view === "trash" ? "bg-[#1A1A2E] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-[#E87722]"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {tu.tabTrash}
            {trashCount > 0 && (
              <span className={`text-xs rounded-full px-1.5 ${view === "trash" ? "bg-white/20" : "bg-gray-100"}`}>
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={tu.search}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="">{tu.allRoles}</option>
            <option value="AU_PAIR">{c.roleAuPair}</option>
            <option value="FAMILLE">{c.roleFamily}</option>
          </select>
          {view === "active" && (
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white"
            >
              <option value="">{tu.allStatuses}</option>
              <option value="ACTIVE">{c.profileStatus.ACTIVE}</option>
              <option value="PENDING">{c.profileStatus.PENDING}</option>
              <option value="HIDDEN">{c.profileStatus.HIDDEN}</option>
              <option value="SUSPENDED">{c.profileStatus.SUSPENDED}</option>
            </select>
          )}
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {tu.colUser}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {tu.colRole}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {c.status}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {tu.colSubscription}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {tu.colSignedUp}
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {c.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold  shrink-0 overflow-hidden">
                            {u.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.photoUrl}
                                alt=""
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1A2E]">
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            u.role === "AU_PAIR" ? "default" : "secondary"
                          }
                        >
                          {u.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(u.status)}</td>
                      <td className="px-5 py-3.5">
                        {u.subscribed ? (
                          <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {c.active}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/profil/${u.id}?role=${u.role}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title={c.viewProfile}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {view === "trash" ? (
                            <>
                              <button
                                disabled={processingId === u.id}
                                onClick={() => handleAction(u, "restore")}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                                title={tu.restore}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                disabled={processingId === u.id}
                                onClick={() => handleAction(u, "purge")}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title={tu.purge}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {u.status === "PENDING" && (
                                <button
                                  disabled={processingId === u.id}
                                  onClick={() => handleAction(u, "validate")}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                                  title={c.validate}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {u.status === "HIDDEN" ? (
                                <button
                                  disabled={processingId === u.id}
                                  onClick={() => handleAction(u, "unhide")}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                  title={c.unhide}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  disabled={processingId === u.id}
                                  onClick={() => handleAction(u, "hide")}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                  title={c.hide}
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                                title={tu.sendEmail}
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                disabled={processingId === u.id}
                                onClick={() => handleAction(u, "delete")}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title={tu.moveToTrash}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
          title={tu.trashTitle}
          description={
            <>
              {tu.accountOf}{" "}
              <span className="font-semibold text-[#1A1A2E]">
                {deleteTarget.name}
              </span>{" "}
              {tu.trashText}
            </>
          }
          confirmLabel={tu.moveToTrash}
          loading={processingId === deleteTarget.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {purgeTarget && (
        <ConfirmDialog
          title={tu.purgeTitle}
          description={
            <>
              {tu.accountOf}{" "}
              <span className="font-semibold text-[#1A1A2E]">
                {purgeTarget.name}
              </span>{" "}
              {tu.purgeText} {c.irreversible}
            </>
          }
          confirmLabel={tu.purge}
          loading={processingId === purgeTarget.id}
          onConfirm={confirmPurge}
          onCancel={() => setPurgeTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
