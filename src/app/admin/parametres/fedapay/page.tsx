"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Lock, ShieldCheck, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n";

interface Settings {
  fedapayPublicKeyConfigured: boolean;
  fedapaySecretKeyConfigured: boolean;
  fedapayWebhookSecretConfigured: boolean;
  fedapayEnvironment: string;
}

export default function AdminFedapaySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [environment, setEnvironment] = useState("sandbox");
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
      .then((data) => {
        setSettings(data.settings ?? null);
        if (data.settings?.fedapayEnvironment) setEnvironment(data.settings.fedapayEnvironment);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (body: Record<string, unknown>) => {
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
        return;
      }
      setSettings(data.settings);
      setPublicKeyInput("");
      setSecretKeyInput("");
      setWebhookSecretInput("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(c.networkError);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    const body: Record<string, unknown> = {};
    if (publicKeyInput.trim()) body.fedapayPublicKey = publicKeyInput.trim();
    if (secretKeyInput.trim()) body.fedapaySecretKey = secretKeyInput.trim();
    if (webhookSecretInput.trim()) body.fedapayWebhookSecret = webhookSecretInput.trim();
    if (environment !== settings?.fedapayEnvironment) body.fedapayEnvironment = environment;
    if (Object.keys(body).length === 0) return;
    save(body);
  };

  const handleRemove = (field: "fedapayPublicKey" | "fedapaySecretKey" | "fedapayWebhookSecret", label: string) => {
    if (!confirm(ts.removeFedapayConfirm(label))) return;
    save({ [field]: "" });
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

  const configured = settings.fedapayPublicKeyConfigured && settings.fedapaySecretKeyConfigured;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{ts.fedapayTitle}</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            {c.save}
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {c.saved}
          </p>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
          {/* Environnement */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
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
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[#E87722]" />
              {ts.publicKey}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {c.currentStatus}{" "}
              {settings.fedapayPublicKeyConfigured ? (
                <span className="text-green-600 font-semibold">{c.configured}</span>
              ) : (
                <span className="text-red-500 font-semibold">{ts.publicKeyMissing}</span>
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
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              {ts.secretKey}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {c.currentStatus}{" "}
              {settings.fedapaySecretKeyConfigured ? (
                <span className="text-green-600 font-semibold">{c.configured}</span>
              ) : (
                <span className="text-red-500 font-semibold">{ts.secretKeyMissing}</span>
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
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              {ts.webhookSecret}
            </label>
            <p className="text-sm text-gray-500 mb-2">
              {ts.webhookSecretHint} {c.currentStatus}{" "}
              {settings.fedapayWebhookSecretConfigured ? (
                <span className="text-green-600 font-semibold">{c.configured}</span>
              ) : (
                <span className="text-red-500 font-semibold">{ts.webhookSecretMissing}</span>
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
            <p className="text-xs font-semibold text-gray-500 mb-1">{ts.webhookUrl}</p>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/fedapay
            </code>
            <p className="text-xs text-gray-400 mt-1">
              {ts.webhookUrlHint}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
