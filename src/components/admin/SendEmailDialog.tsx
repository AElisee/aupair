"use client";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

interface SendEmailDialogProps {
  user: { id: string; name: string; email: string };
  onSent: () => void;
  onCancel: () => void;
}

type SentEmail = {
  id: string;
  subject: string;
  message: string;
  status: "SENT" | "FAILED";
  recipientEmail: string;
  sentByName: string | null;
  createdAt: string;
};

const FIELD =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]";

/**
 * Envoi d'un email libre à un utilisateur (POST /api/admin/users/email) et historique
 * des emails déjà envoyés à cet utilisateur (GET /api/admin/users/email?userId=).
 */
export default function SendEmailDialog({ user, onSent, onCancel }: SendEmailDialogProps) {
  const { t, tError, locale } = useI18n();
  const c = t.adminCommon;
  const tu = t.adminUsers;
  const [tab, setTab] = useState<"new" | "history">("new");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SentEmail[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const loadHistory = useCallback(() => {
    fetch(`/api/admin/users/email?userId=${encodeURIComponent(user.id)}`)
      .then((res) => (res.ok ? res.json() : { emails: [] }))
      .then((data) => setHistory(data.emails ?? []))
      .catch(() => setHistory([]));
  }, [user.id]);

  useEffect(loadHistory, [loadHistory]);

  const canSend = subject.trim() !== "" && message.trim() !== "" && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, subject, message }),
      });
      if (res.ok) {
        onSent();
        return;
      }
      const data = await res.json().catch(() => null);
      setError(tError(data?.error, tu.emailError));
      // L'échec est lui aussi enregistré côté serveur.
      loadHistory();
    } catch {
      setError(c.networkError);
    } finally {
      setSending(false);
    }
  };

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
      active ? "bg-[#1A1A2E] text-white" : "text-gray-500 hover:bg-gray-100"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={sending ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#FFF3E0]">
            <Mail className="w-5 h-5 text-[#E87722]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#1A1A2E]">{tu.emailTitle}</h3>
            <p className="text-sm text-gray-500 mt-1 truncate">
              {tu.emailTo} : <span className="text-[#1A1A2E]">{user.name}</span> &lt;{user.email}&gt;
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={sending}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label={c.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 mt-4">
          <button onClick={() => setTab("new")} className={tabClass(tab === "new")}>
            {tu.emailTabNew}
          </button>
          <button onClick={() => setTab("history")} className={tabClass(tab === "history")}>
            {tu.emailTabHistory}
            {history && history.length > 0 && <span className="ml-1.5 text-xs opacity-70">{history.length}</span>}
          </button>
        </div>

        {tab === "new" ? (
          <>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">{tu.emailSubject}</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  autoFocus
                  className={FIELD}
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">{tu.emailMessage}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={5000}
                  rows={8}
                  className={`${FIELD} resize-y`}
                />
                <span className="block text-xs text-gray-400 mt-1">{tu.emailMessageHint}</span>
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={onCancel} disabled={sending}>
                {c.cancel}
              </Button>
              <Button onClick={send} disabled={!canSend}>
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {tu.emailSend}
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4 overflow-y-auto min-h-32">
            {history === null ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 text-[#E87722] mx-auto animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{tu.emailHistoryEmpty}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {history.map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => setOpenId(openId === e.id ? null : e.id)}
                      className="w-full text-left py-3 px-1 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[#1A1A2E] truncate">{e.subject}</span>
                        {e.status === "SENT" ? (
                          <Badge variant="success">{tu.emailStatusSent}</Badge>
                        ) : (
                          <Badge variant="destructive">{tu.emailStatusFailed}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(e.createdAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
                        {e.sentByName && ` · ${tu.emailSentBy(e.sentByName)}`}
                        {e.recipientEmail !== user.email && ` · ${e.recipientEmail}`}
                      </p>
                      {openId === e.id && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{e.message}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
