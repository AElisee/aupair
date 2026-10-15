"use client";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Eye, EyeOff, Ban, Trash2, Clock, Loader2, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useI18n } from "@/i18n";

type PendingProfile = {
  userId: string;
  role: "AU_PAIR" | "FAMILLE";
  name: string;
  country: string;
  flag: string;
  age: number;
  description: string;
  waitingDays: number;
  hasPhoto: boolean;
  photoUrl: string;
  hasId: boolean;
};

type ReportUser = { id: string; name: string; role: string } | null;

type Report = {
  id: string;
  reason: string;
  description: string | null;
  isResolved: boolean;
  createdAt: string;
  reporter: ReportUser;
  reported: ReportUser;
};

export default function ModerationPage() {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingReportId, setProcessingReportId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendingProfile | null>(null);
  const { t, locale, tValue } = useI18n();
  const c = t.adminCommon;
  const m = t.adminModeration;

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/moderation").then((res) => res.json()),
      fetch("/api/reports?resolved=false").then((res) => res.json()),
    ])
      .then(([moderationData, reportsData]) => {
        setProfiles(moderationData.profiles ?? []);
        setReports(reportsData.reports ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const performAction = async (p: PendingProfile, action: "validate" | "hide" | "suspend" | "delete") => {
    setProcessingId(p.userId);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: p.userId, role: p.role, action }),
      });
      if (res.ok) {
        setProfiles((prev) => prev.filter((item) => item.userId !== p.userId));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleAction = (p: PendingProfile, action: "validate" | "hide" | "suspend" | "delete") => {
    if (action === "delete") {
      setDeleteTarget(p);
      return;
    }
    performAction(p, action);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await performAction(deleteTarget, "delete");
    setDeleteTarget(null);
  };

  const handleResolveReport = async (reportId: string) => {
    setProcessingReportId(reportId);
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action: "resolve" }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } finally {
      setProcessingReportId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{m.title}</h1>
          <Badge variant="warning">{m.pendingCount(profiles.length)}</Badge>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="font-bold text-[#1A1A2E] text-lg">{m.emptyTitle}</h2>
            <p className="text-gray-500">{m.emptyText}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div key={p.userId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt="" className="w-full h-full object-cover object-top" />
                      ) : (
                        p.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#1A1A2E]">{p.name}</h3>
                        <span className="text-lg">{p.flag}</span>
                        <Badge variant={p.role === "AU_PAIR" ? "default" : "secondary"}>
                          {p.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${p.hasPhoto ? "text-green-600" : "text-red-500"}`}>
                          {p.hasPhoto ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {m.photo}
                        </span>
                        <span className={`flex items-center gap-1 ${p.hasId ? "text-green-600" : "text-red-500"}`}>
                          {p.hasId ? <CheckCircle className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {m.idDocument}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {p.waitingDays === 0 ? m.today : m.days(p.waitingDays)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/admin/profil/${p.userId}?role=${p.role}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 h-8 px-3 text-xs border-2 border-blue-200 text-blue-600 bg-transparent hover:bg-blue-50"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> {c.viewProfile}
                    </Link>
                    <Button size="sm" disabled={processingId === p.userId} onClick={() => handleAction(p, "validate")}
                      className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> {c.validate}
                    </Button>
                    <Button size="sm" variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50"
                      disabled={processingId === p.userId} onClick={() => handleAction(p, "hide")}>
                      <EyeOff className="w-3.5 h-3.5 mr-1" /> {c.hide}
                    </Button>
                    <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      disabled={processingId === p.userId} onClick={() => handleAction(p, "suspend")}>
                      <Ban className="w-3.5 h-3.5 mr-1" /> {c.suspend}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={processingId === p.userId} onClick={() => handleAction(p, "delete")}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> {c.delete}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signalements */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1A1A2E]">{m.reportsTitle}</h2>
          <Badge variant="destructive">{m.openReports(reports.length)}</Badge>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{m.noReports}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-[#1A1A2E]">{tValue(r.reason)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">{r.reporter?.name ?? c.unknownUser}</span> {m.reported}{" "}
                      <span className="font-semibold">{r.reported?.name ?? c.unknownUser}</span>
                    </p>
                    {r.description && (
                      <p className="text-sm text-gray-500 italic mb-2">&laquo; {r.description} &raquo;</p>
                    )}
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString(locale)}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={processingReportId === r.id}
                    onClick={() => handleResolveReport(r.id)}
                    className="bg-green-500 hover:bg-green-600 text-white flex-shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> {m.markResolved}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={m.deleteTitle}
          description={
            <>
              {m.profileOf}{" "}
              <span className="font-semibold text-[#1A1A2E]">{deleteTarget.name}</span>{" "}
              {c.willBeDeleted} {c.irreversible}
            </>
          }
          confirmLabel={c.delete}
          loading={processingId === deleteTarget.userId}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
