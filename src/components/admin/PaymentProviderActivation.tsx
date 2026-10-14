"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power } from "lucide-react";
import { useI18n } from "@/i18n";

const PROVIDER_NAMES = { fedapay: "FedaPay", geniuspay: "GeniusPay" } as const;
type Provider = keyof typeof PROVIDER_NAMES;

/**
 * Bloc "agrégateur actif" affiché en tête des pages de paramètres FedaPay / GeniusPay :
 * un seul agrégateur sert les nouveaux paiements, l'autre reste configuré et réactivable à tout moment.
 */
export default function PaymentProviderActivation({
  provider,
  activeProvider,
  configured,
  saving,
  onActivate,
}: {
  provider: Provider;
  activeProvider: Provider;
  configured: boolean;
  saving: boolean;
  onActivate: () => void;
}) {
  const { t } = useI18n();
  const ts = t.adminSettings;
  const name = PROVIDER_NAMES[provider];
  const isActive = provider === activeProvider;

  const handleActivate = () => {
    if (!confirm(ts.activateProviderConfirm(name))) return;
    onActivate();
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Power className="w-4 h-4 text-[#E87722]" />
          <span className="font-semibold text-[#1A1A2E]">{ts.providerTitle}</span>
          <Badge variant={isActive ? "success" : "secondary"}>
            {isActive ? ts.providerActiveBadge : ts.providerInactiveBadge}
          </Badge>
        </div>
        {!isActive && (
          <Button type="button" onClick={handleActivate} disabled={saving || !configured}>
            {ts.activateProvider(name)}
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {isActive ? ts.providerActive(name) : ts.providerInactive(name, PROVIDER_NAMES[activeProvider])}
      </p>
      {!isActive && !configured && <p className="text-xs text-red-500 mt-1">{ts.activateNeedsKeys}</p>}
    </div>
  );
}
