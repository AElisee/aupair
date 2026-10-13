"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Loader2,
  Save,
  Languages,
  GraduationCap,
  Clock,
  Flag,
  CreditCard,
  CheckCircle,
  ListChecks,
  Image as ImageIcon,
} from "lucide-react";
import { useI18n } from "@/i18n";

interface Settings {
  languages: string[];
  educationLevels: string[];
  durations: string[];
  reportReasons: string[];
  subscriptionPriceEur: number;
  subscriptionPriceXof: number;
  subscriptionDays: number;
  subscriptionFeatures: string[];
  heroImageUrl: string;
}

function EditableList({
  title,
  icon,
  items,
  onChange,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const { t } = useI18n();

  const add = () => {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setDraft("");
  };

  const remove = (item: string) => onChange(items.filter((i) => i !== item));

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-400">{t.adminSettings.noItems}</p>
        )}
        {items.map((item) => (
          <Badge key={item} className="gap-1.5 pr-1.5">
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
              title={t.adminSettings.removeItem}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={t.adminSettings.addItem}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminConstantesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState("");
  const { t, tError } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  useEffect(() => {
    fetch("/api/admin/constants")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? null))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/constants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.saveError));
        return;
      }
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(c.networkError);
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    setHeroUploading(true);
    setHeroError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/hero-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setHeroError(tError(data.error, ts.heroUploadError));
        return;
      }
      setSettings((prev) => (prev ? { ...prev, heroImageUrl: data.url } : prev));
    } catch {
      setHeroError(c.networkError);
    } finally {
      setHeroUploading(false);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">
            {ts.constantsTitle}
          </h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            {c.save}
          </Button>
        </div>

        <p className="text-sm text-gray-500">{ts.constantsHint}</p>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {c.saved}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <EditableList
            title={ts.languages}
            icon={<Languages className="w-4 h-4 text-[#E87722]" />}
            items={settings.languages}
            onChange={(languages) => setSettings({ ...settings, languages })}
          />
          <EditableList
            title={ts.educationLevels}
            icon={<GraduationCap className="w-4 h-4 text-[#E87722]" />}
            items={settings.educationLevels}
            onChange={(educationLevels) =>
              setSettings({ ...settings, educationLevels })
            }
          />
          <EditableList
            title={ts.durations}
            icon={<Clock className="w-4 h-4 text-[#E87722]" />}
            items={settings.durations}
            onChange={(durations) => setSettings({ ...settings, durations })}
          />
          <EditableList
            title={ts.reportReasons}
            icon={<Flag className="w-4 h-4 text-[#E87722]" />}
            items={settings.reportReasons}
            onChange={(reportReasons) =>
              setSettings({ ...settings, reportReasons })
            }
          />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#E87722]" />
            {ts.subscription}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {ts.priceEur}
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={settings.subscriptionPriceEur}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptionPriceEur: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {ts.priceXof}
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={settings.subscriptionPriceXof}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptionPriceXof: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {ts.durationDays}
              </label>
              <input
                type="number"
                min={1}
                step="1"
                value={settings.subscriptionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    subscriptionDays: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#E87722]" />
            {ts.heroImageTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {ts.heroImage}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHeroImageUpload(file);
                  e.target.value = "";
                }}
                disabled={heroUploading}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#E87722] file:text-white file:text-sm file:font-medium file:cursor-pointer disabled:opacity-60"
              />
              {heroUploading && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {c.uploading}
                </p>
              )}
              {heroError && <p className="text-xs text-red-500 mt-1">{heroError}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {ts.heroImageHint}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-[#1A1A2E]">
              {settings.heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.heroImageUrl}
                  alt={ts.heroImageAlt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        <EditableList
          title={ts.subscriptionFeatures}
          icon={<ListChecks className="w-4 h-4 text-[#E87722]" />}
          items={settings.subscriptionFeatures}
          onChange={(subscriptionFeatures) =>
            setSettings({ ...settings, subscriptionFeatures })
          }
        />
      </div>
    </AdminLayout>
  );
}
