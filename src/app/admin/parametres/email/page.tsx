"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Mail, Key, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";

interface Settings {
  emailFrom: string | null;
  resendApiKeyConfigured: boolean;
}

export default function AdminEmailSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erreur réseau, veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!settings) return;
    const body: Record<string, unknown> = { emailFrom: settings.emailFrom ?? "" };
    if (apiKeyInput.trim()) {
      body.resendApiKey = apiKeyInput.trim();
    }
    save(body);
  };

  const handleRemoveKey = () => {
    if (!confirm("Supprimer la clé API Resend ? Aucun email ne pourra plus être envoyé jusqu'à ce qu'une nouvelle clé soit renseignée.")) {
      return;
    }
    save({ resendApiKey: "" });
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
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — Email (Resend)</h1>
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
              Clé API Resend
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.resendApiKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — aucun email ne sera envoyé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={settings.resendApiKeyConfigured ? "•••••••••••••••• (laisser vide pour ne pas changer)" : "re_xxxxxxxxxxxxxxxxxxxxxxxx"}
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.resendApiKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveKey} disabled={saving} title="Supprimer la clé">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Obtenez votre clé sur{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                resend.com/api-keys <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-[#E87722]" />
              Adresse d&apos;expédition (From)
            </label>
            <input
              type="text"
              value={settings.emailFrom ?? ""}
              onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
              placeholder='AuPair A.EU <contact@votre-domaine.com>'
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
            <p className="text-xs text-gray-400 mt-1">
              Le domaine de cette adresse doit être vérifié dans Resend, sinon l&apos;envoi échouera.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
