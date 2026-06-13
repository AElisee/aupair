"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { CreditCard, Key, Loader2, Save, CheckCircle, Trash2, ExternalLink, Webhook } from "lucide-react";

interface Settings {
  stripeSecretKeyConfigured: boolean;
  stripeWebhookSecretConfigured: boolean;
}

export default function AdminStripeSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/constants")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? null))
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
    if (secretKeyInput.trim()) body.stripeSecretKey = secretKeyInput.trim();
    if (webhookSecretInput.trim()) body.stripeWebhookSecret = webhookSecretInput.trim();
    if (Object.keys(body).length === 0) return;
    save(body);
  };

  const handleRemoveSecretKey = () => {
    if (!confirm("Supprimer la clé secrète Stripe ? Le paiement par carte ne fonctionnera plus jusqu'à ce qu'une nouvelle clé soit renseignée.")) {
      return;
    }
    save({ stripeSecretKey: "" });
  };

  const handleRemoveWebhookSecret = () => {
    if (!confirm("Supprimer le secret de signature du webhook Stripe ? Les paiements ne pourront plus être confirmés automatiquement.")) {
      return;
    }
    save({ stripeWebhookSecret: "" });
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

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — Stripe (carte bancaire)</h1>
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
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[#E87722]" />
              Clé secrète Stripe (Secret key)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.stripeSecretKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — le paiement par carte est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder={settings.stripeSecretKeyConfigured ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "sk_live_..."}
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.stripeSecretKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveSecretKey} disabled={saving} title="Supprimer la clé">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Récupérez votre clé secrète (mode test ou live) sur{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                dashboard.stripe.com/apikeys <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Webhook className="w-4 h-4 text-[#E87722]" />
              Secret de signature du webhook (Webhook signing secret)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.stripeWebhookSecretConfigured ? (
                <span className="text-green-600 font-semibold">configuré</span>
              ) : (
                <span className="text-red-500 font-semibold">non configuré — les abonnements ne seront pas activés après paiement</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={webhookSecretInput}
                onChange={(e) => setWebhookSecretInput(e.target.value)}
                placeholder={settings.stripeWebhookSecretConfigured ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "whsec_..."}
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.stripeWebhookSecretConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveWebhookSecret} disabled={saving} title="Supprimer le secret">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Créez un endpoint pointant vers <code className="bg-gray-100 px-1 rounded">/api/webhooks/stripe</code> dans{" "}
              <a
                href="https://dashboard.stripe.com/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                dashboard.stripe.com/webhooks <ExternalLink className="w-3 h-3" />
              </a>{" "}
              (événement <code className="bg-gray-100 px-1 rounded">checkout.session.completed</code>), puis copiez le &quot;Signing secret&quot;.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
            <CreditCard className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
            <p>
              Ces clés remplacent les variables d&apos;environnement <code className="bg-white px-1 rounded">STRIPE_SECRET_KEY</code> et{" "}
              <code className="bg-white px-1 rounded">STRIPE_WEBHOOK_SECRET</code>. Le paiement par carte utilise ces valeurs en priorité.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
