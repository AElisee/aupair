"use client";
import { useI18n } from "@/i18n";

/** Barre de pagination des tableaux du back-office ("1–10 sur 42" + Précédent / pages / Suivant). */
export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useI18n();
  const navButton =
    "px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#E87722] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        {t.adminCommon.range((currentPage - 1) * pageSize + 1, Math.min(currentPage * pageSize, totalItems), totalItems)}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={navButton}>
          {t.adminCommon.previous}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? "bg-[#E87722] text-white" : "border border-gray-200 text-gray-600 hover:border-[#E87722]"}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={navButton}
        >
          {t.adminCommon.next}
        </button>
      </div>
    </div>
  );
}
