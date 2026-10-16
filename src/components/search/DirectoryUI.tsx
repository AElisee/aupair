"use client";

import { useEffect } from "react";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { SelectField } from "@/components/ui/select-field";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Briques communes aux annuaires (/trouver-famille, /trouver-au-pair, recherche des espaces) :
 * hero de recherche, raccourcis pays, tiroir de filtres mobile, tri, pastilles des filtres actifs, état vide.
 */

export type CountryChip = { name: string; count: number; flag: string };

/** Compte les éléments par pays, du plus fourni au moins fourni */
export function buildCountryChips<T>(items: T[], getCountry: (item: T) => string, getFlag: (item: T) => string): CountryChip[] {
  const chips = new Map<string, CountryChip>();
  items.forEach((item) => {
    const name = getCountry(item);
    if (!name) return;
    const chip = chips.get(name);
    if (chip) chip.count += 1;
    else chips.set(name, { name, count: 1, flag: getFlag(item) });
  });
  return [...chips.values()].sort((a, b) => b.count - a.count);
}

export function CountryChips({
  chips,
  value,
  onChange,
  variant,
  className,
}: {
  chips: CountryChip[];
  value: string;
  onChange: (country: string) => void;
  /** dark : sur le hero bleu nuit · light : sur fond clair */
  variant: "dark" | "light";
  className?: string;
}) {
  const { t, tValue } = useI18n();
  if (chips.length < 2) return null;

  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 h-10 inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors",
      variant === "light" && "border",
      active
        ? variant === "dark"
          ? "bg-[#E87722] text-white"
          : "bg-[#E87722] border-[#E87722] text-white"
        : variant === "dark"
          ? "bg-white/10 text-white hover:bg-white/20"
          : "bg-white border-gray-200 text-[#1A1A2E] hover:border-[#E87722]"
    );

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      <button type="button" onClick={() => onChange("")} className={cn(chipClass(!value), "px-4")}>
        {t.directory.allCountries}
      </button>
      {chips.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onChange(value === c.name ? "" : c.name)}
          className={cn(chipClass(value === c.name), "px-3.5")}
        >
          <CountryFlag flag={c.flag} className="h-4 w-auto rounded-[2px]" />
          {tValue(c.name)}
          <span className="text-xs opacity-70">{c.count}</span>
        </button>
      ))}
    </div>
  );
}

/** Hero bleu nuit centré des annuaires publics : titre, sous-titre, recherche, bouton filtres (mobile), raccourcis pays */
export function DirectoryHero({
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder,
  activeCount,
  onOpenFilters,
  countryChips,
}: {
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  activeCount: number;
  onOpenFilters: () => void;
  countryChips: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}
    >
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E87722] opacity-15 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E87722] opacity-5 rounded-full blur-2xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">{title}</h1>
        <p className="text-gray-300 mt-3 max-w-2xl mx-auto text-sm sm:text-base">{subtitle}</p>

        <div className="mt-6 flex gap-2 sm:gap-3 max-w-3xl mx-auto text-left">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              inputMode="search"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-2xl bg-white text-base text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-[#E87722]/40"
            />
          </div>
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={t.common.filters}
            className="lg:hidden relative h-12 sm:h-14 px-4 flex items-center gap-2 rounded-2xl bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">{t.common.filters}</span>
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#E87722] text-[11px] font-semibold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {countryChips && <div className="mt-5 -mx-4 px-4 sm:mx-auto sm:px-0 w-fit max-w-[calc(100%+2rem)] sm:max-w-full">{countryChips}</div>}
      </div>
    </section>
  );
}

/** Carte « Filtres » de la colonne latérale desktop */
export function FilterPanel({
  activeCount,
  onClear,
  children,
}: {
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const d = t.directory;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-medium text-[#1A1A2E] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#E87722]" />
          {activeCount > 0 ? d.filtersCount(activeCount) : t.common.filters}
        </h2>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-[#E87722] hover:underline">
            {d.clearAll}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export type FilterFieldDef<K extends string> = { key: K; label: string; options: { value: string; label: string }[] };

/** Liste de sélecteurs de filtres ; un filtre actif est surligné en orange */
export function FilterFields<K extends string>({
  fields,
  values,
  onChange,
  className = "space-y-3",
}: {
  fields: FilterFieldDef<K>[];
  values: Record<K, string>;
  onChange: (patch: Partial<Record<K, string>>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {fields.map((field) => (
        <SelectField
          key={field.key}
          aria-label={field.label}
          value={values[field.key]}
          onChange={(value) => onChange({ [field.key]: value } as Partial<Record<K, string>>)}
          options={[{ value: "", label: field.label }, ...field.options]}
          triggerClassName={cn(values[field.key] && "border-[#E87722] bg-[#FFF3E0]/40")}
        />
      ))}
    </div>
  );
}

/** Tiroir latéral des filtres, affiché sous `lg` */
export function FilterSheet({
  open,
  onClose,
  onClear,
  resultLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  /** Libellé du bouton de validation, ex. « Voir 12 familles » */
  resultLabel: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 lg:hidden" role="dialog" aria-modal="true" aria-label={t.common.filters}>
      <button type="button" aria-label={t.common.close} onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-y-0 left-0 w-[85vw] max-w-sm flex flex-col bg-white shadow-2xl animate-drawer-in">
        <div className="flex items-center justify-between px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 border-b border-gray-100">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#E87722]" />
            {t.common.filters}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex gap-3 border-t border-gray-100 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <Button variant="ghost" className="h-12 flex-1" onClick={onClear}>
            {t.directory.clearAll}
          </Button>
          <Button className="h-12 flex-[2]" onClick={onClose}>
            {resultLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SortSelect<K extends string>({
  value,
  onChange,
  options,
}: {
  value: K;
  onChange: (value: K) => void;
  options: { value: K; label: string }[];
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="hidden sm:inline">{t.directory.sortLabel}</span>
      <SelectField
        value={value}
        onChange={(v) => onChange(v as K)}
        aria-label={t.directory.sortLabel}
        size="sm"
        className="w-48"
        triggerClassName="h-11"
        options={options}
      />
    </div>
  );
}

export function ActiveFilterChips<K extends string>({
  chips,
  onRemove,
}: {
  chips: { key: K; label: string }[];
  onRemove: (key: K) => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1.5 h-9 pl-3 pr-2 rounded-full bg-[#FFF3E0] text-sm text-[#1A1A2E] hover:bg-[#FFE0B2] transition-colors"
        >
          {chip.label}
          <X className="w-4 h-4 text-[#E87722]" />
        </button>
      ))}
    </div>
  );
}

export function DirectoryEmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof SearchX;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FFF3E0] flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#E87722]" strokeWidth={1.75} />
      </div>
      <p className="font-medium text-[#1A1A2E]">{title}</p>
      {text && <p className="text-sm text-gray-500 mt-1">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Compteur « x sur y affichés » + bouton « Afficher plus » */
export function ShowMore({
  shownLabel,
  moreLabel,
  canShowMore,
  onShowMore,
}: {
  shownLabel: string;
  moreLabel: string;
  canShowMore: boolean;
  onShowMore: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs text-gray-500">{shownLabel}</p>
      {canShowMore && (
        <Button variant="outline" className="h-12 w-full sm:w-auto" onClick={onShowMore}>
          {moreLabel}
        </Button>
      )}
    </div>
  );
}
