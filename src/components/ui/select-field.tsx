"use client";
import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Valeur sentinelle de l'option "Autre" (Radix interdit les valeurs vides). */
const OTHER_VALUE = "__other__";
/** Valeur sentinelle d'une option à valeur vide (ex. « Tous les pays »). */
const EMPTY_VALUE = "__empty__";

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Une option de valeur `""` est autorisée (ex. « Tous ») : elle reste sélectionnable. */
  options: SelectOption[];
  placeholder?: string;
  /** Active une option "Autre" qui ouvre un champ de saisie libre. */
  allowCustom?: boolean;
  otherLabel?: string;
  customPlaceholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  /** `md` : champ de formulaire (48px) · `sm` : filtre compact (36px) · `xs` : barre d'outils (32px). */
  size?: "md" | "sm" | "xs";
  /** Classes du conteneur (largeur, marges). */
  className?: string;
  /** Classes supplémentaires du déclencheur. */
  triggerClassName?: string;
  onBlur?: () => void;
  "aria-label"?: string;
  title?: string;
};

const SIZES = {
  md: "h-12 px-4 text-base sm:text-sm rounded-xl",
  sm: "h-9 px-3 text-sm rounded-xl",
  xs: "h-8 px-2.5 text-xs sm:text-sm rounded-lg",
};

const toRadix = (v: string) => (v === "" ? EMPTY_VALUE : v);
const fromRadix = (v: string) => (v === EMPTY_VALUE ? "" : v);

/**
 * Liste déroulante de la charte AuPair A.EU (Radix Select) : déclencheur blanc arrondi + chevron,
 * menu flottant où l'option choisie est surlignée en orange doux.
 * Avec `allowCustom`, l'utilisateur peut saisir une valeur absente de la liste.
 */
export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  allowCustom = false,
  otherLabel = "Autre",
  customPlaceholder,
  invalid = false,
  disabled,
  required,
  name,
  id,
  size = "md",
  className,
  triggerClassName,
  onBlur,
  "aria-label": ariaLabel,
  title,
}: SelectFieldProps) {
  const isKnown = options.some((o) => o.value === value);
  // Mode saisie libre : choisi explicitement, ou valeur existante absente de la liste
  const [customMode, setCustomMode] = useState(allowCustom && value !== "" && !isKnown);
  const selectValue = customMode ? OTHER_VALUE : isKnown ? toRadix(value) : "";

  const border = invalid
    ? "border-red-300 focus-visible:ring-red-400/30"
    : "border-gray-200 hover:border-gray-300 focus-visible:border-[#E87722] focus-visible:ring-[#E87722]/25 data-[state=open]:border-[#E87722] data-[state=open]:ring-2 data-[state=open]:ring-[#E87722]/20";

  return (
    <div className={cn("space-y-2", className)}>
      <Select.Root
        value={selectValue}
        disabled={disabled}
        required={required}
        name={name}
        onValueChange={(v) => {
          if (v === OTHER_VALUE) {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(fromRadix(v));
          }
        }}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
      >
        <Select.Trigger
          id={id}
          title={title}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          className={cn(
            "group w-full flex items-center justify-between gap-2 border bg-white text-left text-[#1A1A2E] transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-gray-500",
            SIZES[size],
            border,
            triggerClassName
          )}
        >
          <span className="truncate">
            <Select.Value placeholder={placeholder} />
          </span>
          <Select.Icon asChild>
            <ChevronDown
              className="w-4 h-4 shrink-0 text-gray-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
              strokeWidth={1.75}
            />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className="z-[100] min-w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <Select.Viewport className="p-1.5 max-h-72">
              {options.map((o, i) => (
                <SelectItem key={`${i}-${o.value}`} value={toRadix(o.value)} label={o.label} size={size} />
              ))}
              {allowCustom && (
                <>
                  <Select.Separator className="h-px bg-gray-100 my-1" />
                  <SelectItem value={OTHER_VALUE} label={otherLabel} size={size} />
                </>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {customMode && (
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={customPlaceholder}
          maxLength={100}
          className={cn(
            "w-full border bg-white focus:outline-none focus:ring-2",
            SIZES[size],
            invalid ? "border-red-300 focus:ring-red-400/30" : "border-gray-200 focus:border-[#E87722] focus:ring-[#E87722]/25"
          )}
        />
      )}
    </div>
  );
}

function SelectItem({ value, label, size }: { value: string; label: string; size: "md" | "sm" | "xs" }) {
  return (
    <Select.Item
      value={value}
      className={cn(
        "relative flex items-center rounded-lg px-3 text-[#1A1A2E] cursor-pointer select-none outline-none transition-colors",
        size === "md" ? "py-2.5 text-base sm:text-sm" : "py-2 text-sm",
        "data-[highlighted]:bg-gray-50",
        "data-[state=checked]:bg-[#FFF3E0] data-[state=checked]:text-[#E87722] data-[state=checked]:font-medium",
        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
      )}
    >
      <Select.ItemText>{label}</Select.ItemText>
    </Select.Item>
  );
}
