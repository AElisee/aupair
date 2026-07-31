"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Smartphone, Key, Lock, Loader2, Save, CheckCircle, Trash2, ExternalLink } from "lucide-react";

interface Settings {
  sebpayPublicKeyConfigured: boolean;
  sebpaySecretKeyConfigured: boolean;
}

export default function AdminSebpaySettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [publicKeyInput, setPublicKeyInput] = useState("");
  const [secretKeyInput, setSecretKeyInput] = useState("");
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
      setSecretKeyInput("");
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
    if (publicKeyInput.trim()) body.sebpayPublicKey = publicKeyInput.trim();
    if (secretKeyInput.trim()) body.sebpaySecretKey = secretKeyInput.trim();
    if (Object.keys(body).length === 0) return;
    save(body);
  };

  const handleRemovePublicKey = () => {
    if (!confirm("Supprimer la clé publique SebPay ? Le paiement SebPay ne fonctionnera plus.")) return;
    save({ sebpayPublicKey: "" });
  };

  const handleRemoveSecretKey = () => {
    if (!confirm("Supprimer la clé secrète SebPay ? La vérification des paiements ne fonctionnera plus.")) return;
    save({ sebpaySecretKey: "" });
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

  const configured = settings.sebpayPublicKeyConfigured && settings.sebpaySecretKeyConfigured;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Paramètres — SebPay (Mobile Money)</h1>
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
              Clé publique (X-Public-Key)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.sebpayPublicKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — le paiement SebPay est désactivé</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKeyInput}
                onChange={(e) => setPublicKeyInput(e.target.value)}
                placeholder={
                  settings.sebpayPublicKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "pk_live_... ou pk_test_..."
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.sebpayPublicKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemovePublicKey} disabled={saving} title="Supprimer la clé publique">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>

          {/* Clé secrète */}
          <div>
            <label className="font-semibold text-[#1A1A2E] flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#E87722]" />
              Clé secrète (X-Secret-Key)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Statut actuel :{" "}
              {settings.sebpaySecretKeyConfigured ? (
                <span className="text-green-600 font-semibold">configurée</span>
              ) : (
                <span className="text-red-500 font-semibold">non configurée — la vérification des paiements est désactivée</span>
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={secretKeyInput}
                onChange={(e) => setSecretKeyInput(e.target.value)}
                placeholder={
                  settings.sebpaySecretKeyConfigured
                    ? "•••••••••••••••• (laisser vide pour ne pas changer)"
                    : "sk_live_... ou sk_test_..."
                }
                autoComplete="off"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
              {settings.sebpaySecretKeyConfigured && (
                <Button type="button" variant="outline" onClick={handleRemoveSecretKey} disabled={saving} title="Supprimer la clé secrète">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Récupérez vos clés depuis{" "}
              <a
                href="https://new.sebpay.bj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E87722] hover:underline inline-flex items-center gap-0.5"
              >
                new.sebpay.bj <ExternalLink className="w-3 h-3" />
              </a>{" "}
              → Développeurs → API Keys. Le préfixe (<code>pk_live_</code>/<code>sk_live_</code> vs <code>pk_test_</code>/<code>sk_test_</code>) détermine l&apos;environnement.
            </p>
          </div>

          {/* Statut global */}
          <div className="flex items-start gap-2 text-sm text-gray-500 bg-[#FFF3E0] rounded-xl p-3">
            <Smartphone className="w-4 h-4 text-[#E87722] mt-0.5 shrink-0" />
            <p>
              {configured ? (
                <>SebPay est <strong className="text-green-600">opérationnel</strong>. Les utilisateurs peuvent payer par Mobile Money (MTN, Moov, Orange, Wave) via SebPay.</>
              ) : (
                <>SebPay est <strong className="text-red-500">désactivé</strong>. Renseignez les deux clés pour activer le paiement Mobile Money via SebPay.</>
              )}
            </p>
          </div>

          {/* URL Webhook */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">URL Webhook à configurer dans SebPay :</p>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/sebpay
            </code>
            <p className="text-xs text-gray-400 mt-1">
              Ajoutez cette URL dans votre tableau de bord SebPay → Paramètres → Webhooks.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
