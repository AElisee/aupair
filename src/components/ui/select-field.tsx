"use client";
import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

/** Valeur sentinelle de l'option "Autre" (Radix interdit les valeurs vides). */
const OTHER_VALUE = "__other__";

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  /** Active une option "Autre" qui ouvre un champ de saisie libre. */
  allowCustom?: boolean;
  otherLabel?: string;
  customPlaceholder?: string;
  invalid?: boolean;
  onBlur?: () => void;
  "aria-label"?: string;
};

/**
 * Liste déroulante stylée (Radix Select) : déclencheur blanc arrondi + chevron,
 * menu flottant. Avec `allowCustom`, l'utilisateur peut saisir une valeur absente de la liste.
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
  onBlur,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const isKnown = options.some((o) => o.value === value);
  // Mode saisie libre : choisi explicitement, ou valeur existante absente de la liste
  const [customMode, setCustomMode] = useState(allowCustom && value !== "" && !isKnown);
  const selectValue = customMode ? OTHER_VALUE : isKnown ? value : "";

  const border = invalid
    ? "border-red-300 focus:ring-red-400"
    : "border-gray-200 focus:ring-[#E87722]";

  return (
    <div className="space-y-2">
      <Select.Root
        value={selectValue}
        onValueChange={(v) => {
          if (v === OTHER_VALUE) {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(v);
          }
        }}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
      >
        <Select.Trigger
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          className={`w-full flex items-center justify-between gap-2 border rounded-xl px-4 py-3 text-sm bg-white text-left text-[#1A1A2E] focus:outline-none focus:ring-2 data-[placeholder]:text-gray-400 ${border}`}
        >
          <span className="truncate">
            <Select.Value placeholder={placeholder} />
          </span>
          <Select.Icon>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-[100] w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
          >
            <Select.Viewport className="p-1.5 max-h-72">
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value} label={o.label} />
              ))}
              {allowCustom && (
                <>
                  <Select.Separator className="h-px bg-gray-100 my-1" />
                  <SelectItem value={OTHER_VALUE} label={otherLabel} />
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
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${border}`}
        />
      )}
    </div>
  );
}

function SelectItem({ value, label }: { value: string; label: string }) {
  return (
    <Select.Item
      value={value}
      className="relative flex items-center rounded-lg pl-3 pr-8 py-2.5 text-sm text-[#1A1A2E] cursor-pointer select-none outline-none data-[highlighted]:bg-[#FFF3E0] data-[highlighted]:text-[#E87722] data-[state=checked]:font-semibold"
    >
      <Select.ItemText>{label}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-3">
        <Check className="w-4 h-4 text-[#E87722]" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}
