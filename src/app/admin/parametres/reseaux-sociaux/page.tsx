"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Loader2, Save, CheckCircle } from "lucide-react";
import { TiktokIcon } from "@/components/icons/TiktokIcon";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";

type UrlKey = "instagramUrl" | "tiktokUrl" | "facebookUrl";
type EnabledKey = "instagramEnabled" | "tiktokEnabled" | "facebookEnabled";
type SocialLinks = Record<UrlKey, string> & Record<EnabledKey, boolean>;

const NETWORKS: { url: UrlKey; enabled: EnabledKey; label: string; icon: React.ElementType; placeholder: string }[] = [
  { url: "instagramUrl", enabled: "instagramEnabled", label: "Instagram", icon: Instagram, placeholder: "https://www.instagram.com/votre-compte" },
  { url: "tiktokUrl", enabled: "tiktokEnabled", label: "TikTok", icon: TiktokIcon, placeholder: "https://www.tiktok.com/@votre-compte" },
  { url: "facebookUrl", enabled: "facebookEnabled", label: "Facebook", icon: Facebook, placeholder: "https://www.facebook.com/votre-page" },
];

function toLinks(settings: Partial<Record<UrlKey, string | null> & Record<EnabledKey, boolean>> | null | undefined): SocialLinks {
  return {
    instagramUrl: settings?.instagramUrl ?? "",
    tiktokUrl: settings?.tiktokUrl ?? "",
    facebookUrl: settings?.facebookUrl ?? "",
    instagramEnabled: settings?.instagramEnabled ?? true,
    tiktokEnabled: settings?.tiktokEnabled ?? true,
    facebookEnabled: settings?.facebookEnabled ?? true,
  };
}

function StatusBadge({ enabled, hasUrl }: { enabled: boolean; hasUrl: boolean }) {
  const { t } = useI18n();
  const ts = t.adminSettings;
  if (!enabled) return <span className="text-xs text-gray-400">{ts.socialHidden}</span>;
  if (!hasUrl) return <span className="text-xs text-amber-600">{ts.socialMissingUrl}</span>;
  return <span className="text-xs text-green-600 font-medium">{ts.socialVisible}</span>;
}

export default function AdminSocialSettingsPage() {
  const [links, setLinks] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const { t, tError } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  useEffect(() => {
    fetch("/api/admin/constants")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.settings) throw new Error(data?.error);
        setLinks(toLinks(data.settings));
      })
      .catch((err: Error) => setError(tError(err.message, c.networkError)))
      .finally(() => setLoading(false));
  }, [tError, c]);

  const handleSave = async () => {
    if (!links) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/constants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(links),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.saveError));
        return;
      }
      setLinks(toLinks(data.settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(c.networkError);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !links) {
    return (
      <AdminLayout>
        <div className="p-12 text-center">
          {loading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
              <p className="text-gray-500">{c.loading}</p>
            </>
          ) : (
            <p className="text-red-500 text-sm">{error || c.networkError}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight">{ts.socialTitle}</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            {c.save}
          </Button>
        </div>
        <Separator />

        <p className="text-sm text-gray-500">{ts.socialSubtitle}</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {c.saved}
          </p>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
          {NETWORKS.map(({ url, enabled, label, icon: Icon, placeholder }) => (
            <div key={url}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <label htmlFor={url} className="font-medium text-[#1A1A2E] flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#E87722]" />
                  {label}
                  <StatusBadge enabled={links[enabled]} hasUrl={!!links[url].trim()} />
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={links[enabled]}
                  aria-label={ts.socialShowInFooter(label)}
                  title={ts.socialShowInFooter(label)}
                  onClick={() => setLinks({ ...links, [enabled]: !links[enabled] })}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 items-center rounded-full transition-colors ${
                    links[enabled] ? "bg-[#E87722]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      links[enabled] ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <input
                id={url}
                type="url"
                inputMode="url"
                value={links[url]}
                onChange={(e) => setLinks({ ...links, [url]: e.target.value })}
                placeholder={placeholder}
                className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] ${
                  links[enabled] ? "" : "text-gray-400 bg-gray-50"
                }`}
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">{ts.socialUrlHint}</p>
        </div>
      </div>
    </AdminLayout>
  );
}
