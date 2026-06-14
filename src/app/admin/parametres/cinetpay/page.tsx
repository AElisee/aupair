"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Hash, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";

interface Settings {
  cinetpayApiKeyConfigured: boolean;
  cinetpaySiteIdConfigured: boolean;
}

export default function AdminCinetPaySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [siteIdInput, setSiteIdInput] = useState("");
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
      setApiKeyInput("");
      setSiteIdInput("");
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
    if (apiKeyInput.trim()) body.cinetpayApiKey = apiKeyInput.trim();
    if (siteIdInput.trim()) body.cinetpaySiteId = siteIdInput.trim();
    if (Object.keys(body).length === 0) return;
    save(body);
  };

  const handleRemoveApiKey = () => {
    if (!confirm("Supprimer la clé API CinetPay ? Le paiement Mobile Money ne fonctionnera plus jusqu'à ce qu'une nouvelle clé soit renseignée.")) {
      return;
    }
    save({ cinetpayApiKey: "" });
  };

  const handleRemoveSiteId = () => {
    if (!confirm("Supprimer le SITE_ID CinetPay ? Le paiement Mobile Money ne fonctionnera plus jusqu'à ce qu'un nouveau SITE_ID soit renseigné.")) {
      return;
    }
    save({ cinetpaySiteId: "" });
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
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — CinetPay (Mobile Money)</h1>
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
              Clé API (API_KEY)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.cinetpayApiKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — le paiement Mobile Money est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={settings.cinetpayApiKeyConfigured ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "Votre API_KEY CinetPay"}
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.cinetpayApiKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveApiKey} disabled={saving} title="Supprimer la clé">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-[#E87722]" />
              Identifiant de site (SITE_ID)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.cinetpaySiteIdConfigured ? (
                <span className="text-green-600 font-semibold">configuré</span>
              ) : (
                <span className="text-red-500 font-semibold">non configuré — le paiement Mobile Money est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={siteIdInput}
                onChange={(e) => setSiteIdInput(e.target.value)}
                placeholder={settings.cinetpaySiteIdConfigured ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "Votre SITE_ID CinetPay"}
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.cinetpaySiteIdConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveSiteId} disabled={saving} title="Supprimer le SITE_ID">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Récupérez vos identifiants depuis{" "}
              <a
                href="https://app.cinetpay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                app.cinetpay.com <ExternalLink className="w-3 h-3" />
              </a>{" "}
              → Intégrations → Mes applications.
            </p>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
            <Smartphone className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
            <p>
              Ces clés remplacent les variables d&apos;environnement <code className="bg-white px-1 rounded">CINETPAY_API_KEY</code> et{" "}
              <code className="bg-white px-1 rounded">CINETPAY_SITE_ID</code>. Le paiement Mobile Money utilise ces valeurs en priorité. Le
              mode test (sandbox) s&apos;active depuis le tableau de bord CinetPay et utilise les mêmes identifiants.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
