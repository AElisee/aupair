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
  Users,
  BadgeCheck,
  CreditCard,
  Ban,
} from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusReasonDialog, { StatusChangeInfo, type StatusChange } from "@/components/admin/StatusReasonDialog";
import SendEmailDialog from "@/components/admin/SendEmailDialog";
import { useAdminCan } from "@/components/admin/AdminPermissionsContext";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { GREEN, INDIGO, NAVY, PAGE_TITLE, TEAL, KpiGrid, pct } from "@/components/admin/AdminUI";
import { SelectField } from "@/components/ui/select-field";
import { CountryFlag } from "@/components/ui/CountryFlag";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "AU_PAIR" | "FAMILLE";
  country: string;
  flag: string;
  completion: number;
  status: string;
  subscribed: boolean;
  createdAt: string;
  photoUrl: string;
  /** Dernière suspension / suppression : date et heure, admin, motif */
  statusChange: StatusChange | null;
};

type Action = "validate" | "hide" | "unhide" | "suspend" | "delete" | "restore" | "purge";

const PAGE_SIZE = 10;

export default function UtilisateursPage() {
  const can = useAdminCan();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"active" | "trash">("active");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<AdminUser | null>(null);
  const [emailTarget, setEmailTarget] = useState<AdminUser | null>(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const { t, tValue, tError, locale } = useI18n();
  const c = t.adminCommon;
  const tu = t.adminUsers;
  const ts = t.adminStatusChange;

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  /** Renvoie `true` si l'action a réussi (les boîtes de dialogue restent ouvertes sinon) */
  const performAction = async (u: AdminUser, action: Action, reason?: string): Promise<boolean> => {
    setProcessingId(u.id);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id, role: u.role, action, reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(tError(data.error, ts.error));
        return false;
      }
      if (action === "purge") {
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        return true;
      }
      if (action === "restore") {
        const data = await res.json();
        // Un compte jamais validé repasse en attente : il quitte la liste (→ /admin/moderation)
        setUsers((prev) =>
          data.status === "PENDING"
            ? prev.filter((item) => item.id !== u.id)
            : prev.map((item) => (item.id === u.id ? { ...item, status: data.status, statusChange: null } : item)),
        );
        return true;
      }
      const status = {
        validate: "ACTIVE",
        hide: "HIDDEN",
        unhide: "ACTIVE",
        suspend: "SUSPENDED",
        delete: "DELETED",
      }[action];
      // Suspension / suppression : date, admin et motif renvoyés par l'API ; réactivation : effacés
      const data = await res.json().catch(() => ({}));
      const statusChange: StatusChange | null | undefined =
        action === "suspend" || action === "delete" ? data.statusChange ?? null : status === "ACTIVE" ? null : undefined;
      setUsers((prev) =>
        prev.map((item) =>
          item.id === u.id ? { ...item, status, ...(statusChange !== undefined ? { statusChange } : {}) } : item,
        ),
      );
      return true;
    } catch {
      setActionError(ts.error);
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = (u: AdminUser, action: Action) => {
    setActionError(null);
    if (action === "delete") {
      setDeleteTarget(u);
      return;
    }
    if (action === "suspend") {
      setSuspendTarget(u);
      return;
    }
    if (action === "purge") {
      setPurgeTarget(u);
      return;
    }
    performAction(u, action);
  };

  const confirmDelete = async (reason: string) => {
    if (!deleteTarget) return;
    if (await performAction(deleteTarget, "delete", reason)) setDeleteTarget(null);
  };

  const confirmSuspend = async (reason: string) => {
    if (!suspendTarget) return;
    if (await performAction(suspendTarget, "suspend", reason)) setSuspendTarget(null);
  };

  const confirmPurge = async () => {
    if (!purgeTarget) return;
    await performAction(purgeTarget, "purge");
    setPurgeTarget(null);
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchCountry = !filterCountry || u.country === filterCountry;

    if (view === "trash") {
      return u.status === "DELETED" && matchSearch && matchRole && matchCountry;
    }
    if (u.status === "DELETED") return false;

    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchCountry && matchStatus;
  });

  // Pays présents parmi les comptes, triés selon la langue d'affichage
  const countryOptions = [...new Set(users.map((u) => u.country).filter(Boolean))]
    .map((country) => ({ value: country, label: tValue(country) }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));

  const trashCount = users.filter((u) => u.status === "DELETED").length;

  // KPIs calculés sur les comptes hors corbeille
  const accounts = users.filter((u) => u.status !== "DELETED");
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const countStatus = (...statuses: string[]) => accounts.filter((u) => statuses.includes(u.status)).length;
  const auPairCount = accounts.filter((u) => u.role === "AU_PAIR").length;
  const subscribedCount = accounts.filter((u) => u.role === "AU_PAIR" && u.subscribed).length;
  const newCount = accounts.filter((u) => new Date(u.createdAt) >= monthAgo).length;
  const activeCount = countStatus("ACTIVE");
  const restrictedCount = countStatus("HIDDEN", "SUSPENDED");
  const kpis = [
    { icon: Users, value: accounts.length, label: tu.kpiTotal, caption: t.adminDashboard.newThisMonth(newCount), ratio: pct(newCount, accounts.length), color: NAVY },
    { icon: BadgeCheck, value: activeCount, label: tu.kpiActive, caption: tu.shareOfAccounts(pct(activeCount, accounts.length)), ratio: pct(activeCount, accounts.length), color: GREEN },
    { icon: EyeOff, value: restrictedCount, label: tu.kpiRestricted, caption: tu.shareOfAccounts(pct(restrictedCount, accounts.length)), ratio: pct(restrictedCount, accounts.length), color: INDIGO },
    { icon: CreditCard, value: subscribedCount, label: tu.kpiSubscribed, caption: t.adminDashboard.shareOfAuPairs(pct(subscribedCount, auPairCount)), ratio: pct(subscribedCount, auPairCount), color: TEAL },
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return <Badge variant="success">{c.profileStatus.ACTIVE}</Badge>;
    if (s === "SUSPENDED") return <Badge variant="destructive">{c.profileStatus.SUSPENDED}</Badge>;
    if (s === "HIDDEN") return <Badge variant="secondary">{c.profileStatus.HIDDEN}</Badge>;
    if (s === "DELETED") return <Badge variant="destructive">{c.profileStatus.DELETED}</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className={PAGE_TITLE}>{tu.title}</h1>
          <div className="text-sm text-gray-500">{tu.count(filtered.length)}</div>
        </div>
        <Separator />

        {!loading && <KpiGrid items={kpis} />}

        {/* Onglets */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setView("active");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
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
          <div className="relative w-full sm:w-64">
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
          <SelectField
            value={filterRole}
            onChange={(v) => {
              setFilterRole(v);
              setPage(1);
            }}
            options={[
              { value: "", label: tu.allRoles },
              { value: "AU_PAIR", label: c.roleAuPair },
              { value: "FAMILLE", label: c.roleFamily },
            ]}
            size="sm"
            className="w-full sm:w-44"
          />
          <SelectField
            value={filterCountry}
            onChange={(v) => {
              setFilterCountry(v);
              setPage(1);
            }}
            options={[{ value: "", label: tu.allCountries }, ...countryOptions]}
            size="sm"
            className="w-full sm:w-44"
          />
          {view === "active" && (
            <SelectField
              value={filterStatus}
              onChange={(v) => {
                setFilterStatus(v);
                setPage(1);
              }}
              options={[
                { value: "", label: tu.allStatuses },
                { value: "ACTIVE", label: c.profileStatus.ACTIVE },
                { value: "HIDDEN", label: c.profileStatus.HIDDEN },
                { value: "SUSPENDED", label: c.profileStatus.SUSPENDED },
              ]}
              size="sm"
              className="w-full sm:w-44"
            />
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
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tu.colUser}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tu.colCompletion}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tu.colRole}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {c.status}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tu.colSubscription}
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tu.colSignedUp}
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {c.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginated.map((u, i) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-400 tabular-nums">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-medium  shrink-0 overflow-hidden">
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
                            <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
                              {u.name}
                              {u.flag && (
                                <span title={tValue(u.country)} className="inline-flex shrink-0">
                                  <CountryFlag flag={u.flag} className="h-3 w-[18px] object-cover rounded-[2px]" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-600 tabular-nums">{u.completion} %</span>
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
                      <td className="px-5 py-3.5">
                        {statusBadge(u.status)}
                        {(u.status === "SUSPENDED" || u.status === "DELETED") && u.statusChange && (
                          <StatusChangeInfo change={u.statusChange} compact />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.subscribed ? (
                          <span className="text-green-600 text-xs font-medium flex items-center gap-1">
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
                            can("users.delete") && <>
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
                              {can("users.suspend") &&
                                (u.status === "SUSPENDED" ? (
                                  <button
                                    disabled={processingId === u.id}
                                    onClick={() => handleAction(u, "unhide")}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                                    title={ts.reactivate}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    disabled={processingId === u.id}
                                    onClick={() => handleAction(u, "suspend")}
                                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-50"
                                    title={ts.suspend}
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                ))}
                              {!can("users.suspend") || u.status === "SUSPENDED" ? null : u.status === "HIDDEN" ? (
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
                              {can("users.email") && <button
                                onClick={() => setEmailTarget(u)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                                title={tu.sendEmail}
                              >
                                <Mail className="w-4 h-4" />
                              </button>}
                              {can("users.delete") && <button
                                disabled={processingId === u.id}
                                onClick={() => handleAction(u, "delete")}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title={tu.moveToTrash}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>}
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
        <StatusReasonDialog
          title={tu.trashTitle}
          name={deleteTarget.name}
          text={<>{tu.accountOf} {deleteTarget.name} {tu.trashText}</>}
          confirmLabel={tu.moveToTrash}
          loading={processingId === deleteTarget.id}
          error={actionError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {suspendTarget && (
        <StatusReasonDialog
          title={ts.suspendTitle}
          name={suspendTarget.name}
          text={ts.suspendText}
          confirmLabel={ts.suspend}
          loading={processingId === suspendTarget.id}
          error={actionError}
          onConfirm={confirmSuspend}
          onCancel={() => setSuspendTarget(null)}
        />
      )}

      {purgeTarget && (
        <ConfirmDialog
          title={tu.purgeTitle}
          description={
            <>
              {tu.accountOf}{" "}
              <span className="font-medium text-[#1A1A2E]">
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
      {emailTarget && (
        <SendEmailDialog
          user={emailTarget}
          onSent={() => {
            setNotice(tu.emailSent(emailTarget.name));
            setEmailTarget(null);
          }}
          onCancel={() => setEmailTarget(null)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1A1A2E] text-white text-sm px-4 py-3 rounded-xl shadow-lg"
        >
          <CheckCircle className="w-4 h-4 text-green-400" />
          {notice}
        </div>
      )}
    </AdminLayout>
  );
}
