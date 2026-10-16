"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Loader2, CircleCheck, CircleAlert } from "lucide-react";
import { useI18n } from "@/i18n";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ProviderCard from "@/components/admin/payments/ProviderCard";
import ProviderSettingsForm from "@/components/admin/payments/ProviderSettingsForm";
import {
  PROVIDERS,
  PROVIDER_NAMES,
  isProviderConfigured,
  providerEnvironment,
  type PaymentProvider,
  type PaymentSettings,
} from "@/components/admin/payments/types";
import { ICON, PAGE_TITLE, Panel } from "@/components/admin/AdminUI";
import { Separator } from "@/components/ui/separator";

export default function AdminPaymentMethodsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [tab, setTab] = useState<PaymentProvider | null>(null);
  const [activateTarget, setActivateTarget] = useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { t, tError } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  useEffect(() => {
    fetch("/api/admin/constants")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? null))
      .finally(() => setLoading(false));
  }, []);

  /** Enregistre une modification ; renvoie true si elle a réussi (le formulaire vide alors ses champs). */
  const save = async (body: Record<string, unknown>): Promise<boolean> => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/constants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.saveError));
        return false;
      }
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch {
      setError(c.networkError);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const confirmActivate = async () => {
    if (!activateTarget) return;
    await save({ paymentProvider: activateTarget });
    setActivateTarget(null);
  };

  // Onglet ouvert par défaut : l'agrégateur actif
  const currentTab = tab ?? settings?.paymentProvider ?? "fedapay";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className={PAGE_TITLE}>{ts.paymentMethodsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{ts.paymentMethodsSubtitle}</p>
        </div>
        <Separator />

        {loading || !settings ? (
          <Panel className="p-12 text-center">
            <Loader2 className="mx-auto mb-3 animate-spin text-[#E87722]" {...ICON} />
            <p className="text-sm text-gray-500">{c.loading}</p>
          </Panel>
        ) : (
          <>
            <section className="space-y-3">
              <div>
                <h2 className="text-[15px] font-medium text-[#1A1A2E]">{ts.providerSectionTitle}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{ts.providerSectionHint}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {PROVIDERS.map((provider) => (
                  <ProviderCard
                    key={provider}
                    provider={provider}
                    selected={currentTab === provider}
                    active={settings.paymentProvider === provider}
                    configured={isProviderConfigured(settings, provider)}
                    environment={providerEnvironment(settings, provider)}
                    saving={saving}
                    onSelect={() => setTab(provider)}
                    onActivate={() => setActivateTarget(provider)}
                  />
                ))}
              </div>
            </section>

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
                <CircleAlert {...ICON} size={16} className="shrink-0" />
                {error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl bg-[#3FA45B]/10 border border-[#3FA45B]/20 px-4 py-2.5 text-sm text-[#2F7D45]">
                <CircleCheck {...ICON} size={16} className="shrink-0" />
                {c.saved}
              </p>
            )}

            <ProviderSettingsForm key={currentTab} provider={currentTab} settings={settings} saving={saving} save={save} />
          </>
        )}
      </div>

      {activateTarget && settings && (
        <ConfirmDialog
          variant="default"
          title={ts.activateProvider(PROVIDER_NAMES[activateTarget])}
          description={ts.activateProviderConfirm(PROVIDER_NAMES[activateTarget], PROVIDER_NAMES[settings.paymentProvider])}
          confirmLabel={ts.activateProvider(PROVIDER_NAMES[activateTarget])}
          loading={saving}
          onConfirm={confirmActivate}
          onCancel={() => setActivateTarget(null)}
        />
      )}
    </AdminLayout>
  );
}
