"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useI18n } from "@/i18n";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Pages à afficher : toujours la première et la dernière, la page courante et ses voisines,
 * les trous remplacés par des pointillés. Ex. : 1 … 9 10 11 … 17
 */
function getPageItems(current: number, total: number, siblings = 1): PageItem[] {
  // 1 + … + (voisins + courante) + … + dernière
  const maxVisible = siblings * 2 + 5;
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const showStartEllipsis = start > 3;
  const showEndEllipsis = end < total - 2;

  const items: PageItem[] = [1];
  if (showStartEllipsis) {
    items.push("ellipsis-start");
  } else {
    for (let p = 2; p < start; p++) items.push(p);
  }
  // Garde une largeur constante quand on est près d'un bord
  const from = showStartEllipsis ? (showEndEllipsis ? start : total - (siblings * 2 + 2)) : start;
  const to = showEndEllipsis ? (showStartEllipsis ? end : siblings * 2 + 3) : end;
  for (let p = from; p <= to; p++) items.push(p);
  if (showEndEllipsis) {
    items.push("ellipsis-end");
  } else {
    for (let p = to + 1; p < total; p++) items.push(p);
  }
  items.push(total);
  return items;
}

/** Barre de pagination des tableaux du back-office ("1–10 sur 42" + « ‹ 1 … 9 10 11 … 17 › »). */
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
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;
  const goTo = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  const iconButton =
    "inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-orange-50 hover:text-[#E87722] disabled:opacity-35 disabled:pointer-events-none transition-colors";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        {totalItems === 0
          ? t.adminCommon.range(0, 0, 0)
          : t.adminCommon.range((currentPage - 1) * pageSize + 1, Math.min(currentPage * pageSize, totalItems), totalItems)}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-0.5">
          <button type="button" onClick={() => goTo(1)} disabled={isFirst} className={`${iconButton} hidden sm:inline-flex`} aria-label={t.adminCommon.firstPage} title={t.adminCommon.firstPage}>
            <ChevronsLeft size={16} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => goTo(currentPage - 1)} disabled={isFirst} className={iconButton} aria-label={t.adminCommon.previous} title={t.adminCommon.previous}>
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>

          {getPageItems(currentPage, totalPages).map((item) =>
            typeof item === "number" ? (
              <button
                key={item}
                type="button"
                onClick={() => goTo(item)}
                aria-label={t.adminCommon.page(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-sm tabular-nums transition-colors ${
                  item === currentPage
                    ? "bg-[#E87722] text-white font-medium shadow-sm"
                    : "text-gray-600 hover:bg-orange-50 hover:text-[#E87722]"
                }`}
              >
                {item}
              </button>
            ) : (
              <span key={item} className="inline-flex items-end justify-center w-8 h-8 pb-1.5 text-gray-400 select-none" aria-hidden>
                …
              </span>
            ),
          )}

          <button type="button" onClick={() => goTo(currentPage + 1)} disabled={isLast} className={iconButton} aria-label={t.adminCommon.next} title={t.adminCommon.next}>
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => goTo(totalPages)} disabled={isLast} className={`${iconButton} hidden sm:inline-flex`} aria-label={t.adminCommon.lastPage} title={t.adminCommon.lastPage}>
            <ChevronsRight size={16} strokeWidth={1.75} />
          </button>
        </nav>
      )}
    </div>
  );
}
