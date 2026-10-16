"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Loader2, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n";
import PaymentProviderActivation from "@/components/admin/PaymentProviderActivation";
import FedapaySettingsForm from "@/components/admin/payments/FedapaySettingsForm";
import GeniuspaySettingsForm from "@/components/admin/payments/GeniuspaySettingsForm";
import {
  PROVIDER_NAMES,
  isProviderConfigured,
  type PaymentProvider,
  type PaymentSettings,
} from "@/components/admin/payments/types";
import { Separator } from "@/components/ui/separator";

export default function AdminPaymentMethodsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [tab, setTab] = useState<PaymentProvider | null>(null);
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

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">{c.loading}</p>
        </div>
      </AdminLayout>
    );
  }

  // Onglet ouvert par défaut : l'agrégateur actif
  const currentTab = tab ?? settings.paymentProvider;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight">{ts.paymentMethodsTitle}</h1>
        <Separator />

        <div className="flex gap-1 border-b border-gray-200">
          {(Object.keys(PROVIDER_NAMES) as PaymentProvider[]).map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => setTab(provider)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                currentTab === provider
                  ? "border-[#E87722] text-[#E87722]"
                  : "border-transparent text-gray-500 hover:text-[#1A1A2E]"
              }`}
            >
              {PROVIDER_NAMES[provider]}
              {provider === settings.paymentProvider && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-green-500 align-middle" />
              )}
            </button>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {c.saved}
          </p>
        )}

        <PaymentProviderActivation
          key={currentTab}
          provider={currentTab}
          activeProvider={settings.paymentProvider}
          configured={isProviderConfigured(settings, currentTab)}
          saving={saving}
          onActivate={() => save({ paymentProvider: currentTab })}
        />

        {currentTab === "fedapay" ? (
          <FedapaySettingsForm settings={settings} saving={saving} save={save} />
        ) : (
          <GeniuspaySettingsForm settings={settings} saving={saving} save={save} />
        )}
      </div>
    </AdminLayout>
  );
}
