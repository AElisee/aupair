"use client";
import { useState } from "react";
import {
  KeyRound, ListChecks, Webhook, ShieldCheck, Loader2, Save, Trash2, ExternalLink, Eye, EyeOff,
  Copy, Check, CircleCheck, CircleAlert, CircleDashed, Info,
} from "lucide-react";
import { useI18n } from "@/i18n";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { GREEN, ICON, Panel, PanelHeader, pct } from "@/components/admin/AdminUI";
import { StatusPill } from "./ProviderCard";
import {
  PROVIDER_NAMES, PROVIDER_STYLES, isProviderConfigured, providerEnvironment,
  type PaymentProvider, type PaymentSettings,
} from "./types";

type KeyField = {
  field: string;
  label: string;
  hint?: string;
  checkLabel: string;
  configured: boolean;
  placeholder: string;
  secret: boolean;
};

const DASHBOARDS: Record<PaymentProvider, { url: string; label: string }> = {
  fedapay: { url: "https://live.fedapay.com", label: "fedapay.com" },
  geniuspay: { url: "https://geniuspay.ci/dashboard/settings?tab=api", label: "geniuspay.ci" },
};

const INPUT =
  "w-full h-10 border border-gray-200 rounded-xl px-3 text-sm bg-white/90 font-mono placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87722]";

/** Clés API, état de la configuration et webhook d'un agrégateur (onglet de /admin/parametres/paiements). */
export default function ProviderSettingsForm({
  provider,
  settings,
  saving,
  save,
}: {
  provider: PaymentProvider;
  settings: PaymentSettings;
  saving: boolean;
  save: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;
  const name = PROVIDER_NAMES[provider];
  const { color } = PROVIDER_STYLES[provider];
  const isFedapay = provider === "fedapay";

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [environment, setEnvironment] = useState(settings.fedapayEnvironment || "sandbox");
  const [removeTarget, setRemoveTarget] = useState<KeyField | null>(null);
  const [copied, setCopied] = useState(false);

  const fields: KeyField[] = [
    {
      field: `${provider}PublicKey`,
      label: ts.publicKey,
      checkLabel: ts.checkPublicKey,
      configured: isFedapay ? settings.fedapayPublicKeyConfigured : settings.geniuspayPublicKeyConfigured,
      placeholder: ts.publicKeyPlaceholder,
      secret: false,
    },
    {
      field: `${provider}SecretKey`,
      label: ts.secretKey,
      checkLabel: ts.checkSecretKey,
      configured: isFedapay ? settings.fedapaySecretKeyConfigured : settings.geniuspaySecretKeyConfigured,
      placeholder: ts.secretKeyPlaceholder,
      secret: true,
    },
    {
      field: `${provider}WebhookSecret`,
      label: ts.webhookSecret,
      hint: ts.webhookSecretHint,
      checkLabel: ts.checkWebhook,
      configured: isFedapay ? settings.fedapayWebhookSecretConfigured : settings.geniuspayWebhookSecretConfigured,
      placeholder: isFedapay ? ts.webhookSecretPlaceholder : ts.geniuspayWebhookSecretPlaceholder,
      secret: true,
    },
  ];

  const body: Record<string, unknown> = {};
  for (const { field } of fields) {
    const value = inputs[field]?.trim();
    if (value) body[field] = value;
  }
  if (isFedapay && environment !== settings.fedapayEnvironment) body.fedapayEnvironment = environment;
  const dirty = Object.keys(body).length > 0;

  const submit = async (payload: Record<string, unknown>) => {
    if (await save(payload)) {
      setInputs({});
      setRevealed({});
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    await submit({ [removeTarget.field]: "" });
    setRemoveTarget(null);
  };

  const configured = isProviderConfigured(settings, provider);
  const env = providerEnvironment(settings, provider);
  const done = fields.filter((f) => f.configured).length;
  const envLabel = env === "live" ? ts.live : env === "sandbox" ? ts.sandbox : ts.geniuspayEnvironmentUnknown;

  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/${provider}`;
  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : l'URL reste sélectionnable
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start">
      {/* Clés API */}
      <Panel className="p-5 lg:col-span-2" tint={color}>
        <PanelHeader
          icon={KeyRound}
          color={color}
          title={`${ts.keysTitle} · ${name}`}
          subtitle={ts.keysSubtitle(name)}
          action={
            <button
              type="button"
              onClick={() => submit(body)}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {saving ? <Loader2 {...ICON} size={16} className="animate-spin" /> : <Save {...ICON} size={16} />}
              {c.save}
            </button>
          }
        />

        <div className="divide-y divide-gray-200/60">
          {/* Environnement : choisi pour FedaPay, déduit des clés pour GeniusPay */}
          <div className="pb-5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-sm font-medium text-[#1A1A2E] flex items-center gap-2">
                <ShieldCheck {...ICON} size={16} className="text-gray-400" />
                {ts.environment}
              </p>
              {!isFedapay && env && <StatusPill tone={env === "live" ? "ok" : "warn"}>{envLabel}</StatusPill>}
            </div>
            <p className="text-xs text-gray-500 mb-3">{isFedapay ? ts.environmentHint : ts.geniuspayEnvironmentHint}</p>
            {isFedapay && (
              <div className="inline-flex p-1 rounded-xl bg-gray-100/80 border border-gray-200/60">
                {(["sandbox", "live"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEnvironment(value)}
                    aria-pressed={environment === value}
                    className={`h-8 px-3.5 rounded-lg text-sm transition ${
                      environment === value ? "bg-white text-[#1A1A2E] shadow-sm font-medium" : "text-gray-500 hover:text-[#1A1A2E]"
                    }`}
                  >
                    {value === "live" ? ts.live : ts.sandbox}
                  </button>
                ))}
              </div>
            )}
          </div>

          {fields.map((f) => {
            const id = `key-${f.field}`;
            const shown = !f.secret || revealed[f.field];
            return (
              <div key={f.field} className="py-5 last:pb-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor={id} className="text-sm font-medium text-[#1A1A2E]">{f.label}</label>
                  <StatusPill tone={f.configured ? "ok" : "warn"}>
                    {f.configured ? <CircleCheck {...ICON} size={13} /> : <CircleAlert {...ICON} size={13} />}
                    {f.configured ? ts.keyConfigured : ts.keyMissing}
                  </StatusPill>
                </div>
                {f.hint && <p className="text-xs text-gray-500 mb-2">{f.hint}</p>}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id={id}
                      type={shown ? "text" : "password"}
                      value={inputs[f.field] ?? ""}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [f.field]: e.target.value }))}
                      placeholder={f.configured ? c.keepEmpty : f.placeholder}
                      // Ce ne sont pas des identifiants de connexion : le gestionnaire de mots de passe du navigateur
                      // (et les extensions LastPass / 1Password / Bitwarden) ne doit rien pré-remplir ici
                      name={f.field}
                      autoComplete={f.secret ? "new-password" : "off"}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-form-type="other"
                      spellCheck={false}
                      className={`${INPUT} ${f.secret ? "pr-10" : ""}`}
                    />
                    {f.secret && (
                      <button
                        type="button"
                        onClick={() => setRevealed((prev) => ({ ...prev, [f.field]: !prev[f.field] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-[#1A1A2E]"
                        aria-label={f.label}
                      >
                        {shown ? <EyeOff {...ICON} size={16} /> : <Eye {...ICON} size={16} />}
                      </button>
                    )}
                  </div>
                  {f.configured && (
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(f)}
                      disabled={saving}
                      title={ts.removeKeyTitle(f.label)}
                      aria-label={ts.removeKeyTitle(f.label)}
                      className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Trash2 {...ICON} size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-5 pt-4 border-t border-gray-200/60">
          {ts.keysHintStart}{" "}
          <a
            href={DASHBOARDS[provider].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
          >
            {DASHBOARDS[provider].label} <ExternalLink {...ICON} size={12} />
          </a>{" "}
          {isFedapay ? ts.fedapayKeysHintEnd : ts.geniuspayKeysHintEnd}
        </p>
      </Panel>

      <div className="space-y-6">
        {/* État de la configuration */}
        <Panel className="p-5">
          <PanelHeader icon={ListChecks} color={GREEN} title={ts.checklistTitle} subtitle={ts.checklistSubtitle(done, fields.length)} />
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${pct(done, fields.length)}%`, background: GREEN }}
            />
          </div>
          <ul className="space-y-2.5 text-sm">
            {fields.map((f) => (
              <li key={f.field} className="flex items-start gap-2.5">
                {f.configured ? (
                  <CircleCheck {...ICON} size={18} className="shrink-0 text-[#3FA45B]" />
                ) : (
                  <CircleDashed {...ICON} size={18} className="shrink-0 text-gray-300" />
                )}
                <span className={f.configured ? "text-gray-700" : "text-gray-400"}>{f.checkLabel}</span>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              {env === "live" ? (
                <CircleCheck {...ICON} size={18} className="shrink-0 text-[#3FA45B]" />
              ) : (
                <CircleAlert {...ICON} size={18} className="shrink-0 text-amber-500" />
              )}
              <span className="text-gray-700">{ts.checkEnvironment(envLabel)}</span>
            </li>
          </ul>
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-xs ${
              configured ? "bg-[#3FA45B]/10 text-[#2F7D45]" : "bg-amber-50 text-amber-700"
            }`}
          >
            <Info {...ICON} size={16} className="shrink-0 mt-px" />
            <p>
              {configured ? (isFedapay ? ts.fedapayOperational : ts.geniuspayOperational) : ts.providerDisabled(name)}
              {configured && env === "sandbox" && <span className="block mt-1 font-medium">{ts.sandboxWarning}</span>}
            </p>
          </div>
        </Panel>

        {/* Webhook */}
        <Panel className="p-5">
          <PanelHeader icon={Webhook} color={color} title={ts.webhookTitle} subtitle={ts.webhookSubtitle(name)} />
          <div className="flex items-stretch gap-2">
            <code className="flex-1 min-w-0 bg-gray-50/90 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 break-all">
              {webhookUrl}
            </code>
            <button
              type="button"
              onClick={copyWebhook}
              title={copied ? ts.copied : ts.copy}
              aria-label={copied ? ts.copied : ts.copy}
              className={`w-10 shrink-0 inline-flex items-center justify-center rounded-xl border transition ${
                copied ? "border-[#3FA45B]/40 bg-[#3FA45B]/10 text-[#2F7D45]" : "border-gray-200 bg-white/90 text-gray-500 hover:text-[#1A1A2E]"
              }`}
            >
              {copied ? <Check {...ICON} size={16} /> : <Copy {...ICON} size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">{isFedapay ? ts.fedapayWebhookUrlHint : ts.geniuspayWebhookUrlHint}</p>
        </Panel>
      </div>

      {removeTarget && (
        <ConfirmDialog
          title={ts.removeKeyTitle(removeTarget.label)}
          description={ts.removeKeyWarning(name)}
          confirmLabel={c.delete}
          loading={saving}
          onConfirm={confirmRemove}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
