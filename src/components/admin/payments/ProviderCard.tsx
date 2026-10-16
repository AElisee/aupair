"use client";
import { Power } from "lucide-react";
import { useI18n } from "@/i18n";
import { GREEN, ICON, IconChip, Panel } from "@/components/admin/AdminUI";
import { PROVIDER_NAMES, PROVIDER_STYLES, type PaymentProvider } from "./types";

/** Pastille compacte (statut, environnement) des cartes et formulaires de paiement */
export function StatusPill({ tone, children }: { tone: "ok" | "warn" | "off"; children: React.ReactNode }) {
  const tones = {
    ok: "bg-[#3FA45B]/12 text-[#2F7D45]",
    warn: "bg-amber-100/80 text-amber-700",
    off: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

/**
 * Carte d'un agrégateur : sélectionne l'onglet de configuration au clic,
 * et propose de l'activer (un seul agrégateur sert les nouveaux paiements).
 */
export default function ProviderCard({
  provider,
  selected,
  active,
  configured,
  environment,
  saving,
  onSelect,
  onActivate,
}: {
  provider: PaymentProvider;
  selected: boolean;
  active: boolean;
  configured: boolean;
  environment: "sandbox" | "live" | null;
  saving: boolean;
  onSelect: () => void;
  onActivate: () => void;
}) {
  const { t } = useI18n();
  const ts = t.adminSettings;
  const { icon, color } = PROVIDER_STYLES[provider];
  const name = PROVIDER_NAMES[provider];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-2xl cursor-pointer outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#E87722] ${
        selected ? "ring-2 ring-[#E87722]/70" : "ring-1 ring-transparent hover:ring-gray-200"
      }`}
    >
      <Panel className="p-5 h-full flex flex-col gap-4" tint={selected ? color : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <IconChip icon={icon} color={color} />
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-[#1A1A2E]">{name}</p>
              <p className="text-xs text-gray-500 truncate">{ts.providerDescriptions[provider]}</p>
            </div>
          </div>
          {active ? (
            <StatusPill tone="ok">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
              {ts.providerActiveBadge}
            </StatusPill>
          ) : (
            <StatusPill tone="off">{ts.providerStandbyBadge}</StatusPill>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={configured ? "ok" : "warn"}>{configured ? ts.providerReady : ts.providerIncomplete}</StatusPill>
          {environment && (
            <StatusPill tone={environment === "live" ? "ok" : "warn"}>
              {environment === "live" ? ts.live : ts.sandbox}
            </StatusPill>
          )}
        </div>

        {!active && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-200/60">
            <p className="text-xs text-gray-500 flex-1 min-w-40">{configured ? "" : ts.activateNeedsKeys}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
              disabled={saving || !configured}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Power {...ICON} size={16} />
              {ts.activateProvider(name)}
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
