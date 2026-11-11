"use client";
import { useState } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useI18n } from "@/i18n";
import { isValidStatusReason, STATUS_REASON_MAX_LENGTH, STATUS_REASON_MIN_LENGTH } from "@/lib/status-reason";

/**
 * Confirmation d'une suspension / suppression / d'un rejet avec champ « Motif ».
 * `required` : le bouton reste désactivé tant que le motif est trop court (même règle que l'API).
 */
export default function StatusReasonDialog({
  title,
  name,
  text,
  confirmLabel,
  required = true,
  label,
  placeholder,
  variant = "destructive",
  loading = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  /** Nom du compte concerné, affiché en tête */
  name: string;
  text?: React.ReactNode;
  confirmLabel: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  variant?: "destructive" | "default";
  loading?: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const ts = t.adminStatusChange;
  const [reason, setReason] = useState("");
  const valid = !required || isValidStatusReason(reason);

  return (
    <ConfirmDialog
      title={title}
      variant={variant}
      showIcon={false}
      wide
      description={
        <>
          <p className="font-medium text-[#1A1A2E]">{name}</p>
          {text && <p className="mt-1">{text}</p>}
          <label className="block mt-4 text-xs font-medium text-gray-600">
            {label ?? ts.reasonRequired}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={STATUS_REASON_MAX_LENGTH}
              rows={5}
              required={required}
              autoFocus
              placeholder={placeholder ?? ts.reasonPlaceholder}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#1A1A2E] font-normal focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-y"
            />
          </label>
          {required && <p className="mt-1 text-[11px] text-gray-400">{ts.reasonHint(STATUS_REASON_MIN_LENGTH)}</p>}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </>
      }
      confirmLabel={confirmLabel}
      confirmDisabled={!valid}
      loading={loading}
      onConfirm={() => valid && onConfirm(reason.trim())}
      onCancel={onCancel}
    />
  );
}

export type StatusChange = { at: string; by: string | null; reason: string | null };

/** « Le 11/11/2026 à 14:32 · par X » + motif, sous un badge de statut */
export function StatusChangeInfo({ change, compact = false }: { change: StatusChange; compact?: boolean }) {
  const { t, locale } = useI18n();
  const ts = t.adminStatusChange;
  const d = new Date(change.at);
  const date = d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={compact ? "mt-1 max-w-[260px]" : ""}>
      <p className="text-[11px] text-gray-500 whitespace-nowrap tabular-nums">
        {ts.on(date, time)} · {ts.by(change.by ?? ts.unknownAdmin)}
      </p>
      {change.reason ? (
        <p className={`text-xs text-gray-600 italic ${compact ? "line-clamp-2" : "whitespace-pre-line"}`} title={change.reason}>
          {compact ? change.reason : `${ts.reason} : ${change.reason}`}
        </p>
      ) : (
        <p className="text-[11px] text-gray-400">{ts.noReason}</p>
      )}
    </div>
  );
}
