"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Key, Lock, ShieldCheck, Loader2, Save, Trash2, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n";
import type { PaymentSettings } from "./types";

type KeyField = "geniuspayPublicKey" | "geniuspaySecretKey" | "geniuspayWebhookSecret";

const EMPTY_INPUTS: Record<KeyField, string> = { geniuspayPublicKey: "", geniuspaySecretKey: "", geniuspayWebhookSecret: "" };

/** Formulaire des clés GeniusPay (onglet GeniusPay de /admin/parametres/paiements). */
export default function GeniuspaySettingsForm({
  settings,
  saving,
  save,
}: {
  settings: PaymentSettings;
  saving: boolean;
  save: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [inputs, setInputs] = useState<Record<KeyField, string>>(EMPTY_INPUTS);
  const { t } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  const submit = async (body: Record<string, unknown>) => {
    if (await save(body)) setInputs(EMPTY_INPUTS);
  };

  const handleSave = () => {
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(inputs)) {
      if (value.trim()) body[key] = value.trim();
    }
    if (Object.keys(body).length === 0) return;
    submit(body);
  };

  const handleRemove = (field: KeyField, label: string) => {
    if (!confirm(ts.removeGeniuspayConfirm(label))) return;
    submit({ [field]: "" });
  };

  const configured = settings.geniuspayPublicKeyConfigured && settings.geniuspaySecretKeyConfigured;

  const keyFields: {
    field: KeyField;
    icon: React.ElementType;
    label: string;
    hint?: string;
    configured: boolean;
    missing: string;
    placeholder: string;
    removeLabel: string;
    type: "text" | "password";
  }[] = [
    {
      field: "geniuspayPublicKey",
      icon: Key,
      label: ts.publicKey,
      configured: settings.geniuspayPublicKeyConfigured,
      missing: ts.geniuspayPublicKeyMissing,
      placeholder: ts.publicKeyPlaceholder,
      removeLabel: ts.removePublicKey,
      type: "text",
    },
    {
      field: "geniuspaySecretKey",
      icon: Lock,
      label: ts.secretKey,
      configured: settings.geniuspaySecretKeyConfigured,
      missing: ts.secretKeyMissing,
      placeholder: ts.secretKeyPlaceholder,
      removeLabel: ts.removeSecretKey,
      type: "password",
    },
    {
      field: "geniuspayWebhookSecret",
      icon: Lock,
      label: ts.webhookSecret,
      hint: ts.webhookSecretHint,
      configured: settings.geniuspayWebhookSecretConfigured,
      missing: ts.webhookSecretMissing,
      placeholder: ts.geniuspayWebhookSecretPlaceholder,
      removeLabel: ts.removeWebhookKey,
      type: "password",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[#1A1A2E]">{ts.geniuspayTitle}</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          {c.save}
        </Button>
      </div>

      {/* Environnement (déduit des clés) */}
      <div>
        <p className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#E87722]" />
          {ts.environment}
        </p>
        <p className="text-sm text-gray-500">{ts.geniuspayEnvironmentHint}</p>
        {settings.geniuspayPublicKeyConfigured && (
          <p className="text-sm font-medium text-[#1A1A2E] mt-1">
            {settings.geniuspayEnvironment
              ? ts.geniuspayEnvironmentDetected(settings.geniuspayEnvironment === "live" ? ts.live : ts.sandbox)
              : ts.geniuspayEnvironmentUnknown}
          </p>
        )}
      </div>

      {keyFields.map(({ field, icon: Icon, label, hint, configured: isSet, missing, placeholder, removeLabel, type }) => (
        <div key={field}>
          <label className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-[#E87722]" />
            {label}
          </label>
          <p className="text-sm text-gray-500 mb-2">
            {hint && `${hint} `}
            {c.currentStatus}{" "}
            {isSet ? (
              <span className="text-green-600 font-medium">{c.configured}</span>
            ) : (
              <span className="text-red-500 font-medium">{missing}</span>
            )}
          </p>
          <div className="flex gap-2">
            <input
              type={type}
              value={inputs[field]}
              onChange={(e) => setInputs((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={isSet ? c.keepEmpty : placeholder}
              autoComplete="off"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
            {isSet && (
              <Button type="button" variant="outline" onClick={() => handleRemove(field, removeLabel)} disabled={saving} title={removeLabel}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 -mt-3">
        {ts.geniuspayKeysHintStart}{" "}
        <a
          href="https://geniuspay.ci/dashboard/settings?tab=api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
        >
          geniuspay.ci <ExternalLink className="w-3 h-3" />
        </a>{" "}
        {ts.geniuspayKeysHintEnd}
      </p>

      {/* Statut global */}
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
        <Wallet className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
        <p>
          {configured ? (
            <span className="text-green-700">{ts.geniuspayOperational}</span>
          ) : (
            <span className="text-red-600">{ts.geniuspayDisabled}</span>
          )}
        </p>
      </div>

      {/* URL Webhook */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{ts.geniuspayWebhookUrl}</p>
        <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
          {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/geniuspay
        </code>
        <p className="text-xs text-gray-400 mt-1">{ts.geniuspayWebhookUrlHint}</p>
      </div>
    </div>
  );
}
