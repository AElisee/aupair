"use client";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface ConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** Désactive le bouton de confirmation (ex. champ obligatoire vide) */
  confirmDisabled?: boolean;
  variant?: "destructive" | "default";
  /** Affiche l'icône d'alerte à gauche du titre (par défaut : oui) */
  showIcon?: boolean;
  /** Boîte plus large, pour un contenu de formulaire */
  wide?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  confirmDisabled = false,
  variant = "destructive",
  showIcon = true,
  wide = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onCancel}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full p-6 ${wide ? "max-w-lg" : "max-w-sm"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === "destructive" ? "bg-red-100" : "bg-[#FFF3E0]"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${variant === "destructive" ? "text-red-500" : "text-[#E87722]"}`}
            />
          </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#1A1A2E]">{title}</h3>
            <div className="text-sm text-gray-500 mt-1">{description}</div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label={t.adminCommon.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel ?? t.adminCommon.cancel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel ?? t.adminCommon.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
