"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Loader2,
  Save,
  Languages,
  GraduationCap,
  Clock,
  Flag,
  CreditCard,
  CircleCheck,
  CircleAlert,
  Info,
  Sparkles,
  ImageUp,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { Separator } from "@/components/ui/separator";
import EditableList from "@/components/admin/EditableList";
import { BLUE, GREEN, ICON, INDIGO, ORANGE, PAGE_TITLE, Panel, PanelHeader, TEAL } from "@/components/admin/AdminUI";

/** Champs édités sur cette page (l'image d'accueil est enregistrée à part, dès l'envoi) */
const FIELDS = [
  "languages",
  "educationLevels",
  "durations",
  "reportReasons",
  "subscriptionPriceEur",
  "subscriptionPriceXof",
  "subscriptionDays",
  "subscriptionFeatures",
] as const;

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

type Editable = Pick<Settings, (typeof FIELDS)[number]>;

const pick = (s: Settings): Editable =>
  Object.fromEntries(FIELDS.map((k) => [k, s[k]])) as unknown as Editable;

const INPUT =
  "w-full h-10 border border-gray-200 rounded-xl pl-3 pr-14 text-sm bg-white/90 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#E87722]";

function NumberField({
  id,
  label,
  hint,
  unit,
  value,
  min,
  step,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  unit: string;
  value: number;
  min: number;
  step: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={INPUT}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{unit}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{hint}</p>
    </div>
  );
}

export default function AdminConstantesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [initial, setInitial] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState("");
  const { t, tError, tValue, locale } = useI18n();
  const c = t.adminCommon;
  const ts = t.adminSettings;

  useEffect(() => {
    fetch("/api/admin/constants")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data.settings ?? null);
        setInitial(data.settings ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const dirty = !!settings && !!initial && JSON.stringify(pick(settings)) !== JSON.stringify(pick(initial));

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/constants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pick(settings)),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.saveError));
        return;
      }
      setSettings(data.settings);
      setInitial(data.settings);
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
      // Déjà enregistrée côté serveur : on met à jour les deux états pour ne pas marquer la page comme modifiée
      update("heroImageUrl", data.url);
      setInitial((prev) => (prev ? { ...prev, heroImageUrl: data.url } : prev));
    } catch {
      setHeroError(c.networkError);
    } finally {
      setHeroUploading(false);
    }
  };

  const formatPrice = (amount: number, currency: "EUR" | "XOF") =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "XOF" ? 0 : 2 }).format(
      amount || 0
    );

  const lists = settings
    ? ([
        { key: "languages", title: ts.languages, subtitle: ts.languagesHint, icon: Languages, color: BLUE },
        { key: "educationLevels", title: ts.educationLevels, subtitle: ts.educationLevelsHint, icon: GraduationCap, color: TEAL },
        { key: "durations", title: ts.durations, subtitle: ts.durationsHint, icon: Clock, color: INDIGO },
        { key: "reportReasons", title: ts.reportReasons, subtitle: ts.reportReasonsHint, icon: Flag, color: ORANGE },
      ] as const)
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={PAGE_TITLE}>{ts.constantsTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{ts.constantsSubtitle}</p>
          </div>
          {settings && (
            <div className="flex flex-wrap items-center gap-2">
              {dirty && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100/80 text-amber-700 px-2.5 py-1 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {ts.unsavedChanges}
                  </span>
                  <button
                    type="button"
                    onClick={() => initial && setSettings(initial)}
                    disabled={saving}
                    title={ts.discardChanges}
                    aria-label={ts.discardChanges}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-gray-500 hover:text-[#1A1A2E] transition disabled:opacity-50"
                  >
                    <RotateCcw {...ICON} size={16} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {saving ? <Loader2 {...ICON} size={16} className="animate-spin" /> : <Save {...ICON} size={16} />}
                {c.save}
              </button>
            </div>
          )}
        </div>
        <Separator />

        {loading || !settings ? (
          <Panel className="p-12 text-center">
            <Loader2 className="mx-auto mb-3 animate-spin text-[#E87722]" {...ICON} />
            <p className="text-sm text-gray-500">{c.loading}</p>
          </Panel>
        ) : (
          <>
            <p className="flex items-start gap-2 rounded-xl bg-[#3A5BA8]/8 border border-[#3A5BA8]/15 px-4 py-2.5 text-sm text-[#2C4785]">
              <Info {...ICON} size={16} className="shrink-0 mt-0.5" />
              {ts.constantsHint}
            </p>

            {error && (
              <p className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
                <CircleAlert {...ICON} size={16} className="shrink-0" />
                {error}
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-2 rounded-xl bg-[#3FA45B]/10 border border-[#3FA45B]/20 px-4 py-2.5 text-sm text-[#2F7D45]">
                <CircleCheck {...ICON} size={16} className="shrink-0" />
                {c.saved}
              </p>
            )}

            {/* Abonnement au pair */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <Panel className="p-5 lg:col-span-2" tint={ORANGE}>
                <PanelHeader icon={CreditCard} color={ORANGE} title={ts.subscription} subtitle={ts.subscriptionSubtitle} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <NumberField
                    id="price-eur"
                    label={ts.priceEur}
                    hint={ts.priceEurHint}
                    unit="€"
                    value={settings.subscriptionPriceEur}
                    min={0}
                    step="0.01"
                    onChange={(v) => update("subscriptionPriceEur", v)}
                  />
                  <NumberField
                    id="price-xof"
                    label={ts.priceXof}
                    hint={ts.priceXofHint}
                    unit="FCFA"
                    value={settings.subscriptionPriceXof}
                    min={0}
                    step="1"
                    onChange={(v) => update("subscriptionPriceXof", v)}
                  />
                  <NumberField
                    id="duration-days"
                    label={ts.durationDays}
                    hint={ts.durationDaysHint}
                    unit={ts.daysUnit}
                    value={settings.subscriptionDays}
                    min={1}
                    step="1"
                    onChange={(v) => update("subscriptionDays", v)}
                  />
                </div>

                <div className="mt-5 pt-5 border-t border-gray-200/60">
                  <EditableList
                    bare
                    variant="rows"
                    title={ts.subscriptionFeatures}
                    subtitle={ts.subscriptionFeaturesHint}
                    icon={Sparkles}
                    color={GREEN}
                    items={settings.subscriptionFeatures}
                    placeholder={ts.addFeature}
                    onChange={(v) => update("subscriptionFeatures", v)}
                  />
                </div>
              </Panel>

              {/* Aperçu de l'offre telle que l'au pair la voit */}
              <Panel className="p-5 lg:sticky lg:top-6">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">{ts.subscriptionPreview}</p>
                <div
                  className="rounded-xl p-5 text-white shadow-[0_12px_28px_-14px_rgba(232,119,34,0.8)]"
                  style={{ backgroundImage: "linear-gradient(140deg, #F08A3C 0%, #E87722 55%, #C85F12 100%)" }}
                >
                  <p className="text-sm text-white/85">{ts.subscription}</p>
                  <p className="text-3xl font-semibold tabular-nums mt-1">{formatPrice(settings.subscriptionPriceEur, "EUR")}</p>
                  <p className="text-sm text-white/85 tabular-nums">
                    {formatPrice(settings.subscriptionPriceXof, "XOF")} · {ts.previewPerDays(settings.subscriptionDays || 0)}
                  </p>
                </div>
                {settings.subscriptionFeatures.length > 0 ? (
                  <ul className="mt-4 space-y-2.5 text-sm">
                    {settings.subscriptionFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-gray-700">
                        <CircleCheck {...ICON} size={18} className="shrink-0 text-[#3FA45B]" />
                        {tValue(feature)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">{ts.noItems}</p>
                )}
              </Panel>
            </div>

            {/* Listes de référence */}
            <section className="space-y-3">
              <div>
                <h2 className="text-[15px] font-medium text-[#1A1A2E]">{ts.referenceListsTitle}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{ts.referenceListsHint}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {lists.map((list) => (
                  <EditableList
                    key={list.key}
                    title={list.title}
                    subtitle={list.subtitle}
                    icon={list.icon}
                    color={list.color}
                    items={settings[list.key]}
                    onChange={(v) => update(list.key, v)}
                  />
                ))}
              </div>
            </section>

            {/* Image de la page d'accueil */}
            <Panel className="p-5">
              <PanelHeader icon={ImageIcon} color={INDIGO} title={ts.heroImageTitle} subtitle={ts.heroImageSubtitle} />
              <div className="grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
                <div className="relative rounded-xl overflow-hidden border border-gray-200/70 aspect-video bg-[#1A1A2E]">
                  {settings.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.heroImageUrl} alt={ts.heroImageAlt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50 text-sm">
                      <ImageIcon {...ICON} size={28} />
                      {ts.heroEmpty}
                    </div>
                  )}
                  {heroUploading && (
                    <div className="absolute inset-0 bg-[#1A1A2E]/60 flex items-center justify-center gap-2 text-sm text-white">
                      <Loader2 {...ICON} size={18} className="animate-spin" />
                      {c.uploading}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 bg-white/90 text-sm text-[#1A1A2E] transition focus-within:ring-2 focus-within:ring-[#E87722] ${
                      heroUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-[#E87722]/40 hover:text-[#E87722]"
                    }`}
                  >
                    <ImageUp {...ICON} size={18} />
                    {ts.heroChange}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={heroUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroImageUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-500">{ts.heroImageHint}</p>
                  {heroError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500">
                      <CircleAlert {...ICON} size={14} className="shrink-0" />
                      {heroError}
                    </p>
                  )}
                </div>
              </div>
            </Panel>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
