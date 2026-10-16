"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flag, Loader2, X, CheckCircle2 } from "lucide-react";
import { ICON } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { useConstants } from "@/hooks/useConstants";
import { useI18n } from "@/i18n";

const FIELD =
  "w-full h-11 border border-gray-200 rounded-xl px-3 text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E87722]/40";

/** Signalement d'un interlocuteur : feuille en bas d'écran sur mobile, fenêtre centrée au-delà */
export function ReportDialog({
  open,
  onOpenChange,
  reportedId,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedId: string;
  name: string;
}) {
  const { t, tValue, tError } = useI18n();
  const m = t.messages;
  const { reportReasons } = useConstants();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
      setDescription("");
      setError("");
      setSent(false);
    }
    onOpenChange(next);
  };

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportedId, reason, description: description.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, m.reportError));
        return;
      }
      setSent(true);
    } catch {
      setError(t.common.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed z-50 inset-x-0 bottom-0 w-full rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Flag {...ICON} />
              </span>
              <Dialog.Title className="text-[15px] font-medium text-[#1A1A2E] truncate">{m.reportTitle(name)}</Dialog.Title>
            </div>
            <Dialog.Close
              aria-label={t.common.close}
              className="w-10 h-10 -mr-2 -mt-1 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-[#3FA45B] mx-auto mb-3" strokeWidth={1.5} />
              <Dialog.Description className="text-sm text-gray-600">{m.reportSent}</Dialog.Description>
              <Button className="mt-5 w-full h-11" onClick={() => handleOpenChange(false)}>{t.common.close}</Button>
            </div>
          ) : (
            <>
              <Dialog.Description className="sr-only">{m.reportUser}</Dialog.Description>
              <label htmlFor="report-reason" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">{m.reason}</label>
              <select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={`${FIELD} mb-4`}>
                <option value="">{m.selectReason}</option>
                {reportReasons.map((r) => (
                  <option key={r} value={r}>{tValue(r)}</option>
                ))}
              </select>

              <label htmlFor="report-description" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">{m.descriptionOptional}</label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={m.descriptionPlaceholder}
                className={`${FIELD} h-auto py-2.5 mb-4 resize-none`}
              />

              {error && <p className="text-xs text-red-500 mb-3" role="alert">{error}</p>}

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 h-11 border border-gray-200" onClick={() => handleOpenChange(false)}>
                  {t.common.cancel}
                </Button>
                <Button className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white" onClick={submit} disabled={!reason || submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  {m.send}
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
