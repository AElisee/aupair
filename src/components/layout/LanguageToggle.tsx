"use client";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n, type Lang } from "@/i18n";

const LANGUAGES: { lang: Lang; flag: string; label: string }[] = [
  { lang: "fr", flag: "🇫🇷", label: "Français" },
  { lang: "en", flag: "🇬🇧", label: "English" },
];

/**
 * Sélecteur de langue compact : drapeau + code ISO ("FR", "EN") dans une liste déroulante.
 * `tone="dark"` pour les fonds sombres (menus des espaces connectés), `"light"` sinon.
 */
export function LanguageToggle({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const { lang, setLang } = useI18n();
  const current = LANGUAGES.find((l) => l.lang === lang) ?? LANGUAGES[0];
  const triggerTone =
    tone === "dark"
      ? "border-white/20 text-white hover:bg-white/10"
      : "border-gray-200 text-[#1A1A2E] bg-white hover:bg-gray-50";

  return (
    <Select.Root value={lang} onValueChange={(v) => setLang(v as Lang)}>
      <Select.Trigger
        aria-label="Langue / Language"
        className={`inline-flex items-center gap-1.5 h-7 pl-2 pr-1.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722] ${triggerTone} ${className}`}
      >
        <CountryFlag flag={current.flag} className="h-3 w-[18px] object-cover rounded-[2px] shadow-sm" />
        <Select.Value>{current.lang.toUpperCase()}</Select.Value>
        <Select.Icon>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-[100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <Select.Viewport className="p-1">
            {LANGUAGES.map((l) => (
              <Select.Item
                key={l.lang}
                value={l.lang}
                title={l.label}
                className="relative flex items-center gap-1.5 h-7 pl-2 pr-6 rounded text-xs font-semibold text-[#1A1A2E] cursor-pointer select-none outline-none data-[highlighted]:bg-[#FFF3E0] data-[highlighted]:text-[#E87722]"
              >
                <CountryFlag flag={l.flag} className="h-3 w-[18px] object-cover rounded-[2px] shadow-sm" />
                <Select.ItemText>{l.lang.toUpperCase()}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-1.5">
                  <Check className="w-3 h-3 text-[#E87722]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
