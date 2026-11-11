"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Eye, Ban, Trash2, Clock, Loader2, Hourglass, BadgeCheck, UserPlus, RotateCcw, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { isValidStatusReason, STATUS_REASON_MAX_LENGTH, STATUS_REASON_MIN_LENGTH } from "@/lib/status-reason";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { BLUE, GREEN, INDIGO, ORANGE, PAGE_TITLE, KpiGrid, pct } from "@/components/admin/AdminUI";
import { useAdminCan } from "@/components/admin/AdminPermissionsContext";
import { AdminAvatar, AdminDateTime, AdminIconButton, TD, TH } from "@/components/admin/AdminTable";
import Pagination from "@/components/admin/Pagination";

type PendingProfile = {
  userId: string;
  role: "AU_PAIR" | "FAMILLE";
  name: string;
  email: string;
  country: string;
  flag: string;
  age: number;
  description: string;
  waitingDays: number;
  createdAt: number;
  hasPhoto: boolean;
  photoUrl: string;
  hasId: boolean;
};

type RefusedProfile = PendingProfile & {
  status: "REJECTED" | "SUSPENDED" | "DELETED";
  decidedAt: string;
  decidedBy: string | null;
  reason: string | null;
};

type Tab = "pending" | "refused";
type ProfileAction = "validate" | "reject" | "delete" | "restore";
type DecisionTarget = { profile: PendingProfile; action: "validate" | "reject" | "delete" };

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 15;

/** Page courante bornée au nombre de pages (la liste peut rétrécir après une action) + tranche affichée */
function paginate<T>(items: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  return { totalPages, currentPage, offset, rows: items.slice(offset, offset + PAGE_SIZE) };
}

const tabClass = (active: boolean) =>
  `px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
    active ? "bg-[#1A1A2E] text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-[#E87722]"
  }`;
const counterClass = (active: boolean) => `text-xs rounded-full px-1.5 ${active ? "bg-white/20" : "bg-gray-100"}`;

function StateIcon({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-xs whitespace-nowrap ${ok ? "text-green-600" : "text-red-500"}`}>
      {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

export default function ModerationPage() {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [refused, setRefused] = useState<RefusedProfile[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [pendingPage, setPendingPage] = useState(1);
  const [refusedPage, setRefusedPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [decision, setDecision] = useState<DecisionTarget | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { t, locale, tValue } = useI18n();
  const can = useAdminCan();
  const canAct = can("moderation.validate");
  const c = t.adminCommon;
  const m = t.adminModeration;

  // Chaque liste est chargée indépendamment : l'échec de l'une ne vide pas l'autre
  const loadAll = useCallback(async () => {
    const fetchList = async <T,>(url: string): Promise<T[]> => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
      return (await res.json()).profiles ?? [];
    };
    const [pendingRes, refusedRes] = await Promise.allSettled([
      fetchList<PendingProfile>("/api/admin/moderation"),
      fetchList<RefusedProfile>("/api/admin/moderation?view=refused"),
    ]);
    if (pendingRes.status === "fulfilled") setProfiles(pendingRes.value);
    if (refusedRes.status === "fulfilled") setRefused(refusedRes.value);
    setLoadError(pendingRes.status === "rejected" || refusedRes.status === "rejected");
    setNow(Date.now());
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  const performAction = async (p: PendingProfile, action: ProfileAction, actionReason?: string) => {
    setProcessingId(p.userId);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: p.userId, role: p.role, action, reason: actionReason }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.emailSent === false) setNotice(m.emailFailed);
        // Le profil change d'onglet (ou quitte la modération) : on recharge les deux listes
        await loadAll();
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = (p: PendingProfile, action: ProfileAction) => {
    if (action === "restore") {
      performAction(p, action);
      return;
    }
    setReason("");
    setDecision({ profile: p, action });
  };

  const confirmDecision = async () => {
    if (!decision) return;
    await performAction(decision.profile, decision.action, decision.action === "validate" ? undefined : reason.trim());
    setDecision(null);
  };

  const pendingView = paginate(profiles, pendingPage);
  const refusedView = paginate(refused, refusedPage);

  const auPairPending = profiles.filter((p) => p.role === "AU_PAIR").length;
  const completeCount = profiles.filter((p) => p.hasPhoto && p.hasId).length;
  const recentCount = profiles.filter((p) => now - p.createdAt < DAY_MS).length;
  const maxWait = profiles.reduce((max, p) => Math.max(max, p.waitingDays), 0);
  const avgWait = profiles.length > 0 ? Math.round(profiles.reduce((sum, p) => sum + p.waitingDays, 0) / profiles.length) : 0;
  const kpis = [
    { icon: Hourglass, value: profiles.length, label: m.kpiPending, caption: m.kpiAuPairShare(auPairPending), ratio: pct(auPairPending, profiles.length), color: ORANGE },
    { icon: Clock, value: m.days(avgWait), label: m.kpiAvgWait, caption: m.kpiMaxWait(maxWait), ratio: pct(avgWait, maxWait), color: INDIGO },
    { icon: BadgeCheck, value: completeCount, label: m.kpiComplete, caption: m.kpiCompleteCaption(pct(completeCount, profiles.length)), ratio: pct(completeCount, profiles.length), color: GREEN },
    { icon: UserPlus, value: recentCount, label: m.kpiRecent, caption: m.kpiRecentCaption(pct(recentCount, profiles.length)), ratio: pct(recentCount, profiles.length), color: BLUE },
  ];

  const profileCell = (p: PendingProfile, subtitle: string) => (
    <div className="flex items-center gap-3 min-w-[220px]">
      <AdminAvatar name={p.name} src={p.photoUrl} />
      <div className="min-w-0">
        <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5">
          {p.name}
          {p.flag && (
            <span title={tValue(p.country)} className="inline-flex shrink-0">
              <CountryFlag flag={p.flag} className="h-3 w-[18px] object-cover rounded-[2px]" />
            </span>
          )}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 truncate max-w-[280px]" title={subtitle}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  const roleBadge = (p: PendingProfile) => (
    <Badge variant={p.role === "AU_PAIR" ? "default" : "secondary"}>{p.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}</Badge>
  );

  const viewLink = (p: PendingProfile) => (
    <Link
      href={`/admin/profil/${p.userId}?role=${p.role}`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
      title={c.viewProfile}
    >
      <Eye className="w-4 h-4" />
    </Link>
  );

  const empty = (title: string, text: string) => (
    <div className="p-12 text-center">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
      <h2 className="font-medium text-[#1A1A2E] text-lg">{title}</h2>
      <p className="text-gray-500">{text}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className={PAGE_TITLE}>{m.title}</h1>
          <Badge variant="warning">{m.pendingCount(profiles.length)}</Badge>
        </div>
        <Separator />

        {!loading && <KpiGrid items={kpis} />}

        {notice && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label={c.close} className="text-amber-600 hover:text-amber-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{m.loadError}</div>
        )}

        {/* Onglets */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab("pending")} className={tabClass(tab === "pending")}>
            <Hourglass className="w-4 h-4" />
            {m.tabPending}
            {profiles.length > 0 && <span className={counterClass(tab === "pending")}>{profiles.length}</span>}
          </button>
          <button onClick={() => setTab("refused")} className={tabClass(tab === "refused")}>
            <UserX className="w-4 h-4" />
            {m.tabRefused}
            {refused.length > 0 && <span className={counterClass(tab === "refused")}>{refused.length}</span>}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </div>
          ) : tab === "pending" ? (
            profiles.length === 0 ? (
              empty(m.emptyTitle, m.emptyText)
            ) : (
              <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className={`${TH} w-12`}>#</th>
                      <th className={TH}>{m.colProfile}</th>
                      <th className={TH}>{m.colRole}</th>
                      <th className={TH}>{m.colFile}</th>
                      <th className={TH}>{m.colSignedUp}</th>
                      <th className={`${TH} text-right`}>{c.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingView.rows.map((p, i) => {
                      const busy = processingId === p.userId;
                      return (
                        <tr key={p.userId} className="hover:bg-gray-50 transition-colors">
                          <td className={`${TD} text-xs text-gray-400 tabular-nums`}>{pendingView.offset + i + 1}</td>
                          <td className={TD}>{profileCell(p, p.description)}</td>
                          <td className={TD}>{roleBadge(p)}</td>
                          <td className={TD}>
                            <div className="flex flex-col gap-1">
                              <StateIcon ok={p.hasPhoto} label={m.photo} />
                              <StateIcon ok={p.hasId} label={m.idDocument} />
                            </div>
                          </td>
                          <td className={TD}>
                            <AdminDateTime value={p.createdAt} locale={locale} />
                          </td>
                          <td className={TD}>
                            <div className="flex items-center justify-end gap-1">
                              {viewLink(p)}
                              {canAct && (
                                <>
                                  <AdminIconButton title={c.validate} disabled={busy} onClick={() => handleAction(p, "validate")} className="text-green-600 hover:bg-green-50">
                                    <CheckCircle className="w-4 h-4" />
                                  </AdminIconButton>
                                  <AdminIconButton title={m.reject} disabled={busy} onClick={() => handleAction(p, "reject")} className="text-amber-600 hover:bg-amber-50">
                                    <Ban className="w-4 h-4" />
                                  </AdminIconButton>
                                  <AdminIconButton title={c.delete} disabled={busy} onClick={() => handleAction(p, "delete")} className="text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </AdminIconButton>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={pendingView.currentPage}
                totalPages={pendingView.totalPages}
                pageSize={PAGE_SIZE}
                totalItems={profiles.length}
                onPageChange={setPendingPage}
              />
              </>
            )
          ) : refused.length === 0 ? (
            empty(m.emptyRefusedTitle, m.emptyRefusedText)
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={`${TH} w-12`}>#</th>
                    <th className={TH}>{m.colProfile}</th>
                    <th className={TH}>{m.colRole}</th>
                    <th className={TH}>{c.status}</th>
                    <th className={TH}>{m.colSignedUp}</th>
                    <th className={TH}>{m.colDecision}</th>
                    <th className={TH}>{m.colReason}</th>
                    <th className={`${TH} text-right`}>{c.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {refusedView.rows.map((p, i) => {
                    const busy = processingId === p.userId;
                    const deleted = p.status === "DELETED";
                    return (
                      <tr key={p.userId} className="hover:bg-gray-50 transition-colors">
                        <td className={`${TD} text-xs text-gray-400 tabular-nums`}>{refusedView.offset + i + 1}</td>
                        <td className={TD}>{profileCell(p, p.email)}</td>
                        <td className={TD}>{roleBadge(p)}</td>
                        <td className={TD}>
                          <Badge variant={deleted ? "destructive" : "warning"}>
                            {deleted ? c.profileStatus.DELETED : c.profileStatus.REJECTED}
                          </Badge>
                        </td>
                        <td className={TD}>
                          <AdminDateTime value={p.createdAt} locale={locale} />
                        </td>
                        <td className={TD}>
                          <AdminDateTime value={p.decidedAt} locale={locale} />
                          {p.decidedBy && <p className="text-[11px] text-gray-400 whitespace-nowrap">{m.decidedBy(p.decidedBy)}</p>}
                        </td>
                        <td className={TD}>
                          {p.reason ? (
                            <p className="text-xs text-gray-500 italic line-clamp-2 min-w-[180px] max-w-[300px]" title={p.reason}>
                              {p.reason}
                            </p>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className={TD}>
                          <div className="flex items-center justify-end gap-1">
                            {viewLink(p)}
                            {canAct && (
                              <>
                                <AdminIconButton title={c.validate} disabled={busy} onClick={() => handleAction(p, "validate")} className="text-green-600 hover:bg-green-50">
                                  <CheckCircle className="w-4 h-4" />
                                </AdminIconButton>
                                <AdminIconButton title={m.restore} disabled={busy} onClick={() => handleAction(p, "restore")} className="text-gray-500 hover:bg-gray-100">
                                  <RotateCcw className="w-4 h-4" />
                                </AdminIconButton>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={refusedView.currentPage}
              totalPages={refusedView.totalPages}
              pageSize={PAGE_SIZE}
              totalItems={refused.length}
              onPageChange={setRefusedPage}
            />
            </>
          )}
        </div>
      </div>

      {decision?.action === "validate" && (
        <ConfirmDialog
          title={m.validateTitle}
          variant="default"
          showIcon={false}
          description={
            <>
              {m.validateTextBefore}
              <strong className="font-semibold text-[#1A1A2E]">{decision.profile.name}</strong>
              {m.validateTextAfter}
            </>
          }
          confirmLabel={c.validate}
          loading={processingId === decision.profile.userId}
          onConfirm={confirmDecision}
          onCancel={() => setDecision(null)}
        />
      )}

      {decision && decision.action !== "validate" && (
        <ConfirmDialog
          title={decision.action === "reject" ? m.rejectTitle : m.deleteTitle}
          variant={decision.action === "delete" ? "destructive" : "default"}
          showIcon={false}
          wide
          description={
            <>
              <p className="font-medium text-[#1A1A2E]">{decision.profile.name}</p>
              <label className="block mt-4 text-xs font-medium text-gray-600">
                {/* Motif obligatoire pour une suppression, facultatif pour un rejet */}
                {decision.action === "delete" ? t.adminStatusChange.reasonRequiredEmail : m.reasonLabel}
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={STATUS_REASON_MAX_LENGTH}
                  rows={5}
                  placeholder={m.reasonPlaceholder}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#1A1A2E] font-normal focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-y"
                />
              </label>
              {decision.action === "delete" && (
                <p className="mt-1 text-[11px] text-gray-400">{t.adminStatusChange.reasonHint(STATUS_REASON_MIN_LENGTH)}</p>
              )}
            </>
          }
          confirmDisabled={decision.action === "delete" && !isValidStatusReason(reason)}
          confirmLabel={decision.action === "reject" ? m.reject : c.delete}
          loading={processingId === decision.profile.userId}
          onConfirm={confirmDecision}
          onCancel={() => setDecision(null)}
        />
      )}
    </AdminLayout>
  );
}
