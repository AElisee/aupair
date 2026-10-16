"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Send, Inbox, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import { BLUE, GREEN, INDIGO, ORANGE, PAGE_TITLE, KpiGrid, pct } from "@/components/admin/AdminUI";
import { SelectField } from "@/components/ui/select-field";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type TicketListItem = {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  guestName: string | null;
  guestEmail: string | null;
  user: { id: string; name: string | null; email: string } | null;
  _count: { messages: number };
  createdAt: string;
};

type TicketMessage = {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
};

type TicketDetail = TicketListItem & { messages: TicketMessage[] };

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const STATUS_VARIANTS: Record<TicketStatus, "warning" | "default" | "success" | "secondary"> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const PRIORITY_VARIANTS: Record<TicketPriority, "secondary" | "default" | "warning" | "destructive"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

const requesterName = (t: TicketListItem, anonymous: string) => t.user?.name ?? t.guestName ?? anonymous;
const requesterEmail = (t: TicketListItem) => t.user?.email ?? t.guestEmail ?? "";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | TicketStatus>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { t: i18n, locale } = useI18n();
  const c = i18n.adminCommon;
  const tt = i18n.adminTickets;
  const statusBadge = (status: TicketStatus) => <Badge variant={STATUS_VARIANTS[status]}>{tt.statuses[status]}</Badge>;
  const priorityBadge = (priority: TicketPriority) => <Badge variant={PRIORITY_VARIANTS[priority]}>{tt.priorities[priority]}</Badge>;

  const load = () => {
    fetch("/api/admin/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data.tickets ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const loadDetail = (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    setReply("");
    fetch(`/api/admin/tickets?id=${id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data.ticket ?? null))
      .finally(() => setLoadingDetail(false));
  };

  const applyUpdate = async (patch: { status?: TicketStatus; priority?: TicketPriority; reply?: string }) => {
    if (!selectedId) return;
    const res = await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, ...patch }),
    });
    if (res.ok) {
      const data = await res.json();
      setDetail(data.ticket);
      setTickets((prev) => prev.map((t) => (t.id === selectedId ? { ...t, status: data.ticket.status, priority: data.ticket.priority, _count: { messages: data.ticket.messages.length } } : t)));
    }
    return res.ok;
  };

  const handleStatusChange = async (status: TicketStatus) => {
    setUpdating(true);
    try {
      await applyUpdate({ status });
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    setUpdating(true);
    try {
      await applyUpdate({ priority });
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await applyUpdate({ reply });
      setReply("");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tickets.filter((t) => !statusFilter || t.status === statusFilter);

  const countWhere = (match: (t: TicketListItem) => boolean) => tickets.filter(match).length;
  const kpiItem = (icon: typeof Inbox, label: string, value: number, color: string) => ({
    icon, label, value, color, caption: tt.shareOfTickets(pct(value, tickets.length)), ratio: pct(value, tickets.length),
  });
  const kpis = [
    kpiItem(Inbox, tt.kpiOpen, countWhere((t) => t.status === "OPEN"), ORANGE),
    kpiItem(Clock, tt.kpiInProgress, countWhere((t) => t.status === "IN_PROGRESS"), BLUE),
    kpiItem(CheckCircle, tt.kpiDone, countWhere((t) => t.status === "RESOLVED" || t.status === "CLOSED"), GREEN),
    kpiItem(AlertTriangle, tt.kpiUrgent, countWhere((t) => t.priority === "HIGH" || t.priority === "URGENT"), INDIGO),
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className={PAGE_TITLE}>{tt.title}</h1>
          <div className="text-sm text-gray-500">{tt.count(filtered.length)}</div>
        </div>
        <Separator />

        {!loading && <KpiGrid items={kpis} />}

        {/* Filtres statut */}
        <div className="flex gap-2 flex-wrap">
          {(["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${statusFilter === s ? "bg-[#E87722] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
            >
              {s === "" ? c.all : tt.statuses[s]}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Liste */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">{c.loading}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">{tt.none}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadDetail(t.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedId === t.id ? "bg-[#FFF3E0]" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-[#1A1A2E] text-sm line-clamp-1">{t.subject}</span>
                      {statusBadge(t.status)}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{requesterName(t, tt.anonymous)} · {requesterEmail(t)}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString(locale)}</p>
                      {priorityBadge(t.priority)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détail */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {!selectedId ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Mail className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-400">{tt.selectTicket}</p>
              </div>
            ) : loadingDetail || !detail ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">{c.loading}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-[#1A1A2E] text-lg">{detail.subject}</h2>
                    <p className="text-sm text-gray-500">{requesterName(detail, tt.anonymous)} · {requesterEmail(detail)}</p>
                    <p className="text-xs text-gray-400">{new Date(detail.createdAt).toLocaleString(locale)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <SelectField
                      value={detail.status}
                      disabled={updating}
                      onChange={(v) => handleStatusChange(v as TicketStatus)}
                      options={STATUSES.map((s) => ({ value: String(s), label: tt.statuses[s] }))}
                      size="xs"
                      className="w-32"
                    />
                    <SelectField
                      value={detail.priority}
                      disabled={updating}
                      onChange={(v) => handlePriorityChange(v as TicketPriority)}
                      options={PRIORITIES.map((p) => ({ value: String(p), label: tt.priorities[p] }))}
                      size="xs"
                      className="w-32"
                    />
                  </div>
                </div>

                {/* Message initial */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {detail.description}
                </div>

                {/* Fil de messages */}
                {detail.messages.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {detail.messages.map((m) => (
                      <div key={m.id} className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-xl p-3 text-sm whitespace-pre-wrap ${m.isAdmin ? "bg-[#E87722] text-white" : "bg-gray-100 text-gray-700"}`}>
                          {m.content}
                          <p className={`text-xs mt-1 ${m.isAdmin ? "text-white/70" : "text-gray-400"}`}>
                            {m.isAdmin ? tt.support : tt.requester} · {new Date(m.createdAt).toLocaleString(locale)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Répondre */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-500">{tt.replyLabel}</label>
                  <textarea
                    value={reply} rows={3}
                    onChange={(e) => setReply(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                    placeholder={tt.replyPlaceholder}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleReply} disabled={submitting || !reply.trim()}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                      {tt.send}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
