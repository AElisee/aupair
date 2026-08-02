"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Lock, ShieldCheck, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";

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
        setError(data.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      setSettings(data.settings);
      setPublicKeyInput("");
      setSecretKeyInput("");
      setWebhookSecretInput("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur réseau, veuillez réessayer.");
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
    if (!confirm(`Supprimer ${label} ? Le paiement FedaPay ne fonctionnera plus correctement.`)) return;
    save({ [field]: "" });
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  const configured = settings.fedapayPublicKeyConfigured && settings.fedapaySecretKeyConfigured;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — FedaPay (Mobile Money)</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Enregistrer
          </Button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Modifications enregistrées.
          </p>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
          {/* Environnement */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#E87722]" />
              Environnement
            </label>
            <p className="text-sm text-gray-500 mb-2">
              FedaPay ne permet pas de déduire l&apos;environnement du préfixe de clé : sélectionnez-le explicitement.
              Les clés sandbox et live sont totalement séparées (transactions, webhooks).
            </p>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="sandbox">Sandbox (test)</option>
              <option value="live">Live (production)</option>
            </select>
          </div>

          {/* Clé publique */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[#E87722]" />
              Clé publique
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.fedapayPublicKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — le paiement FedaPay est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
                placeholder={
                  settings.fedapayPublicKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "pk_sandbox_... ou pk_live_..."
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.fedapayPublicKeyConfigured && (
                <Button type="button" variant="outline" onClick={() => handleRemove("fedapayPublicKey", "la clé publique")} disabled={saving} title="Supprimer la clé publique">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Clé secrète */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              Clé secrète
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.fedapaySecretKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — la création de paiement est désactivée</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder={
                  settings.fedapaySecretKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "sk_sandbox_... ou sk_live_..."
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.fedapaySecretKeyConfigured && (
                <Button type="button" variant="outline" onClick={() => handleRemove("fedapaySecretKey", "la clé secrète")} disabled={saving} title="Supprimer la clé secrète">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Clé secrète de webhook */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              Clé secrète de webhook
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Distincte de la clé secrète API. Statut actuel :{" "}
              {settings.fedapayWebhookSecretConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — les webhooks seront rejetés</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={webhookSecretInput}
                onChange={(e) => setWebhookSecretInput(e.target.value)}
                placeholder={
                  settings.fedapayWebhookSecretConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "wh_sandbox_... ou wh_live_..."
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.fedapayWebhookSecretConfigured && (
                <Button type="button" variant="outline" onClick={() => handleRemove("fedapayWebhookSecret", "la clé de webhook")} disabled={saving} title="Supprimer la clé de webhook">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Récupérez vos clés depuis{" "}
              <a
                href="https://live.fedapay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                fedapay.com <ExternalLink className="w-3 h-3" />
              </a>{" "}
              → Développeurs / API → clés publique et secrète, puis Webhooks → clé de signature. Les clés sandbox et
              live sont séparées : basculez l&apos;environnement ci-dessus en conséquence.
            </p>
          </div>

          {/* Statut global */}
          <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
            <Smartphone className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
            <p>
              {configured ? (
                <>FedaPay est <strong className="text-green-600">opérationnel</strong> en mode <strong>{settings.fedapayEnvironment}</strong>. Les utilisateurs sont redirigés vers la page de paiement hébergée FedaPay (Mobile Money, cartes).</>
              ) : (
                <>FedaPay est <strong className="text-red-500">désactivé</strong>. Renseignez la clé publique et la clé secrète pour activer le paiement.</>
              )}
            </p>
          </div>

          {/* URL Webhook */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">URL Webhook à configurer dans FedaPay :</p>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/fedapay
            </code>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez cette URL dans votre tableau de bord FedaPay → Webhooks, puis copiez la clé de signature générée ci-dessus.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
