"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Lock, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";

interface Settings {
  kkiapayPublicKeyConfigured: boolean;
  kkiapayPrivateKeyConfigured: boolean;
}

export default function AdminKkiapaySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
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
      setPublicKeyInput("");
      setPrivateKeyInput("");
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
    if (publicKeyInput.trim()) body.kkiapayPublicKey = publicKeyInput.trim();
    if (privateKeyInput.trim()) body.kkiapayPrivateKey = privateKeyInput.trim();
    if (Object.keys(body).length === 0) return;
    save(body);
  };

  const handleRemovePublicKey = () => {
    if (!confirm("Supprimer la clé publique KKiaPay ? Le paiement KKiaPay ne fonctionnera plus.")) return;
    save({ kkiapayPublicKey: "" });
  };

  const handleRemovePrivateKey = () => {
    if (!confirm("Supprimer la clé privée KKiaPay ? La vérification des paiements ne fonctionnera plus.")) return;
    save({ kkiapayPrivateKey: "" });
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

  const configured = settings.kkiapayPublicKeyConfigured && settings.kkiapayPrivateKeyConfigured;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — KKiaPay (Mobile Money)</h1>
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
          {/* Clé publique */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[#E87722]" />
              Clé publique (Public Key)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.kkiapayPublicKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — le widget KKiaPay est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
                placeholder={
                  settings.kkiapayPublicKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "Votre clé publique KKiaPay"
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.kkiapayPublicKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemovePublicKey} disabled={saving} title="Supprimer la clé publique">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Clé privée */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              Clé privée (Private Key)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.kkiapayPrivateKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — la vérification des paiements est désactivée</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder={
                  settings.kkiapayPrivateKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "Votre clé privée KKiaPay"
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.kkiapayPrivateKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemovePrivateKey} disabled={saving} title="Supprimer la clé privée">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Récupérez vos clés depuis{" "}
              <a
                href="https://app.kkiapay.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                app.kkiapay.me <ExternalLink className="w-3 h-3" />
              </a>{" "}
              → Développeurs → API Keys.
            </p>
          </div>

          {/* Statut global */}
          <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
            <Smartphone className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
            <p>
              {configured ? (
                <>KKiaPay est <strong className="text-green-600">opérationnel</strong>. Les utilisateurs peuvent payer par Mobile Money (MTN, Moov, etc.) via le widget KKiaPay.</>
              ) : (
                <>KKiaPay est <strong className="text-red-500">désactivé</strong>. Renseignez les deux clés pour activer le paiement Mobile Money via KKiaPay.</>
              )}
              {" "}Le mode sandbox s&apos;active depuis le tableau de bord KKiaPay et utilise les mêmes clés.
            </p>
          </div>

          {/* URL Webhook */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">URL Webhook à configurer dans KKiaPay :</p>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/kkiapay
            </code>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez cette URL dans votre tableau de bord KKiaPay → Paramètres → Webhooks.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
