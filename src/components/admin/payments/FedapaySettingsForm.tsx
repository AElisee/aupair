"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Lock, ShieldCheck, Loader2, Save, Trash2, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n";
import type { PaymentSettings } from "./types";

/** Formulaire des clés FedaPay (onglet FedaPay de /admin/parametres/paiements). */
export default function FedapaySettingsForm({
  settings,
  saving,
  save,
}: {
  settings: PaymentSettings;
  saving: boolean;
  save: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [environment, setEnvironment] = useState(settings.fedapayEnvironment || "sandbox");
  const { t } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  const submit = async (body: Record<string, unknown>) => {
    if (await save(body)) {
      setPublicKeyInput("");
      setSecretKeyInput("");
      setWebhookSecretInput("");
    }
  };

  const handleSave = () => {
    const body: Record<string, unknown> = {};
    if (publicKeyInput.trim()) body.fedapayPublicKey = publicKeyInput.trim();
    if (secretKeyInput.trim()) body.fedapaySecretKey = secretKeyInput.trim();
    if (webhookSecretInput.trim()) body.fedapayWebhookSecret = webhookSecretInput.trim();
    if (environment !== settings.fedapayEnvironment) body.fedapayEnvironment = environment;
    if (Object.keys(body).length === 0) return;
    submit(body);
  };

  const handleRemove = (field: "fedapayPublicKey" | "fedapaySecretKey" | "fedapayWebhookSecret", label: string) => {
    if (!confirm(ts.removeFedapayConfirm(label))) return;
    submit({ [field]: "" });
  };

  const configured = settings.fedapayPublicKeyConfigured && settings.fedapaySecretKeyConfigured;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-[#1A1A2E]">{ts.fedapayTitle}</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          {c.save}
        </Button>
      </div>

      {/* Environnement */}
      <div>
        <label className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#E87722]" />
          {ts.environment}
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {ts.environmentHint}
        </p>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
        >
          <option value="sandbox">{ts.sandbox}</option>
          <option value="live">{ts.live}</option>
        </select>
      </div>

      {/* Clé publique */}
      <div>
        <label className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-[#E87722]" />
          {ts.publicKey}
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {c.currentStatus}{" "}
          {settings.fedapayPublicKeyConfigured ? (
            <span className="text-green-600 font-medium">{c.configured}</span>
          ) : (
            <span className="text-red-500 font-medium">{ts.publicKeyMissing}</span>
          )}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={publicKeyInput}
            onChange={(e) => setPublicKeyInput(e.target.value)}
            placeholder={
              settings.fedapayPublicKeyConfigured
                ? c.keepEmpty
                : ts.publicKeyPlaceholder
            }
            autoComplete="off"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
          {settings.fedapayPublicKeyConfigured && (
            <Button type="button" variant="outline" onClick={() => handleRemove("fedapayPublicKey", ts.removePublicKey)} disabled={saving} title={ts.removePublicKey}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Clé secrète */}
      <div>
        <label className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-[#E87722]" />
          {ts.secretKey}
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {c.currentStatus}{" "}
          {settings.fedapaySecretKeyConfigured ? (
            <span className="text-green-600 font-medium">{c.configured}</span>
          ) : (
            <span className="text-red-500 font-medium">{ts.secretKeyMissing}</span>
          )}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={secretKeyInput}
            onChange={(e) => setSecretKeyInput(e.target.value)}
            placeholder={
              settings.fedapaySecretKeyConfigured
                ? c.keepEmpty
                : ts.secretKeyPlaceholder
            }
            autoComplete="off"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
          {settings.fedapaySecretKeyConfigured && (
            <Button type="button" variant="outline" onClick={() => handleRemove("fedapaySecretKey", ts.removeSecretKey)} disabled={saving} title={ts.removeSecretKey}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Clé secrète de webhook */}
      <div>
        <label className="font-medium text-[#1A1A2E] flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-[#E87722]" />
          {ts.webhookSecret}
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {ts.webhookSecretHint} {c.currentStatus}{" "}
          {settings.fedapayWebhookSecretConfigured ? (
            <span className="text-green-600 font-medium">{c.configured}</span>
          ) : (
            <span className="text-red-500 font-medium">{ts.webhookSecretMissing}</span>
          )}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={webhookSecretInput}
            onChange={(e) => setWebhookSecretInput(e.target.value)}
            placeholder={
              settings.fedapayWebhookSecretConfigured
                ? c.keepEmpty
                : ts.webhookSecretPlaceholder
            }
            autoComplete="off"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
          />
          {settings.fedapayWebhookSecretConfigured && (
            <Button type="button" variant="outline" onClick={() => handleRemove("fedapayWebhookSecret", ts.removeWebhookKey)} disabled={saving} title={ts.removeWebhookKey}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {ts.fedapayKeysHintStart}{" "}
          <a
            href="https://live.fedapay.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
          >
            fedapay.com <ExternalLink className="w-3 h-3" />
          </a>{" "}
          {ts.fedapayKeysHintEnd}
        </p>
      </div>

      {/* Statut global */}
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
        <Smartphone className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
        <p>
          {configured ? (
            <span className="text-green-700">{ts.fedapayOperational(settings.fedapayEnvironment)}</span>
          ) : (
            <span className="text-red-600">{ts.fedapayDisabled}</span>
          )}
        </p>
      </div>

      {/* URL Webhook */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{ts.webhookUrl}</p>
        <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
          {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/fedapay
        </code>
        <p className="text-xs text-gray-400 mt-1">
          {ts.webhookUrlHint}
        </p>
      </div>
    </div>
  );
}
