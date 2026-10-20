"use client";
import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  /** Date au format `YYYY-MM-DD` (comme un `<input type="date">`), `""` si vide. */
  value: string;
  onChange: (value: string) => void;
  /** Bornes incluses, format `YYYY-MM-DD`. */
  min?: string;
  max?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Classes du déclencheur (reprend le style des champs du formulaire). */
  className?: string;
  /** Icône calendrier à gauche (barre de filtres) plutôt qu'à droite. */
  iconLeft?: boolean;
  onBlur?: () => void;
  "aria-label"?: string;
  title?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** "YYYY-MM-DD" → Date locale (minuit), ou null si invalide. */
function parseIso(value: string | undefined): Date | null {
  const m = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Champ date de la charte AuPair A.EU : déclencheur arrondi + calendrier flottant
 * (mois/année en listes déroulantes, semaine du lundi au dimanche, aujourd'hui en vert,
 * date choisie en orange, jours hors bornes grisés). Valeur échangée en `YYYY-MM-DD`.
 */
export function DateField({
  value,
  onChange,
  min,
  max,
  id,
  placeholder,
  disabled,
  className,
  iconLeft = false,
  onBlur,
  "aria-label": ariaLabel,
  title,
}: DateFieldProps) {
  const { t, locale } = useI18n();
  const td = t.datePicker;
  const selected = parseIso(value);
  const today = toIso(new Date());
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? parseIso(max && today > max ? max : today)!;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const currentYear = new Date().getFullYear();
  const minYear = parseIso(min)?.getFullYear() ?? currentYear - 100;
  const maxYear = parseIso(max)?.getFullYear() ?? currentYear + 10;

  const monthOptions = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => {
      const label = fmt.format(new Date(2000, i, 1));
      return { value: String(i), label: label.charAt(0).toUpperCase() + label.slice(1) };
    });
  }, [locale]);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const y = String(maxYear - i);
        return { value: y, label: y };
      }),
    [minYear, maxYear]
  );

  // Lu Ma Me… / Mo Tu We… (le 1er janvier 2024 est un lundi)
  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => {
      const label = fmt.format(new Date(2024, 0, 1 + i)).replace(".", "");
      return label.charAt(0).toUpperCase() + label.slice(1, 2);
    });
  }, [locale]);

  // Grille fixe de 6 semaines commençant le lundi
  const days = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(view.year, view.month, 1 - offset + i));
  }, [view]);

  const isOutOfRange = (iso: string) => (min !== undefined && iso < min) || (max !== undefined && iso > max);

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const canGoPrev = view.year > minYear || view.month > 0;
  const canGoNext = view.year < maxYear || view.month < 11;

  const display = selected
    ? new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(selected)
    : "";

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next && selected) setView({ year: selected.getFullYear(), month: selected.getMonth() });
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          title={title}
          aria-label={ariaLabel}
          className={cn(
            "relative flex items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 data-[state=open]:border-[#E87722] data-[state=open]:ring-2 data-[state=open]:ring-[#E87722]/20",
            iconLeft ? "" : "justify-between",
            className
          )}
        >
          {iconLeft && <CalendarDays size={16} strokeWidth={1.25} className="shrink-0 text-gray-400" />}
          <span className={cn("truncate", !display && "text-gray-400")}>{display || placeholder || td.placeholder}</span>
          {!iconLeft && <CalendarDays size={18} strokeWidth={1.5} className="shrink-0 text-gray-400" />}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          // Les listes mois/année s'ouvrent dans leur propre portail : un clic dedans ne ferme pas le calendrier
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement | null)?.closest?.("[data-radix-popper-content-wrapper]")) e.preventDefault();
          }}
          className="z-[90] w-[296px] rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={!canGoPrev}
              aria-label={td.previousMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-1.5">
              <SelectField
                size="xs"
                aria-label={td.month}
                value={String(view.month)}
                onChange={(v) => setView((s) => ({ ...s, month: Number(v) }))}
                options={monthOptions}
                className="w-[112px]"
              />
              <SelectField
                size="xs"
                aria-label={td.year}
                value={String(view.year)}
                onChange={(v) => setView((s) => ({ ...s, year: Number(v) }))}
                options={yearOptions}
                className="w-[84px]"
              />
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              disabled={!canGoNext}
              aria-label={td.nextMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {weekdays.map((w) => (
              <div key={w} className="h-8 flex items-center justify-center text-xs text-gray-500">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const iso = toIso(d);
              const outside = d.getMonth() !== view.month;
              const disabledDay = isOutOfRange(iso);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabledDay}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                    onBlur?.();
                  }}
                  className={cn(
                    "mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-[#E87722] text-white font-medium"
                      : disabledDay
                        ? "text-gray-300 cursor-not-allowed"
                        : isToday
                          ? "bg-[#3FA45B]/15 text-[#2E7D44] font-medium hover:bg-[#3FA45B]/25"
                          : outside
                            ? "text-gray-400 hover:bg-gray-100"
                            : "text-[#1A1A2E] hover:bg-[#FFF3E0] hover:text-[#E87722]"
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
