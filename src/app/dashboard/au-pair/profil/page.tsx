"use client";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Camera,
  Check,
  CheckCircle,
  ExternalLink,
  FileText,
  HeartHandshake,
  HeartPulse,
  Languages,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  PenLine,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { CountryFlag } from "@/components/ui/CountryFlag";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { BLUE, GREEN, ICON, INDIGO, ORANGE, TEAL, Panel, PanelHeader } from "@/components/admin/AdminUI";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { calculateAge } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatPhoneDigits } from "@/lib/phone";
import { SelectField } from "@/components/ui/select-field";

type ProfileStatus = "PENDING" | "ACTIVE" | "HIDDEN" | "SUSPENDED" | "DELETED";

const STATUS_VARIANTS: Record<ProfileStatus, "warning" | "success" | "secondary" | "destructive"> = {
  PENDING: "warning",
  ACTIVE: "success",
  HIDDEN: "secondary",
  SUSPENDED: "destructive",
  DELETED: "destructive",
};

type Profile = {
  status: string;
  profilePhotoUrl: string;
  idDocumentUrls: string[];
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfOrigin: string;
  cityOfOrigin: string;
  languages: string[];
  educationLevel: string;
  childcareExperience: string;
  childcareYears: string;
  firstAidCertified: boolean;
  drivingLicense: boolean;
  targetCountries: string[];
  availableFrom: string;
  availableTo: string;
  preferredDuration: string;
  isSmoker: boolean;
  healthDeclaration: string;
  hasCriminalRecord: boolean;
  description: string;
  motivation: string;
  phoneCountryCode: string;
  phoneNumber: string;
  phoneCountryCode2: string;
  phoneNumber2: string;
};

const EMPTY_PROFILE: Profile = {
  status: "PENDING",
  profilePhotoUrl: "",
  idDocumentUrls: [],
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  countryOfOrigin: "",
  cityOfOrigin: "",
  languages: [],
  educationLevel: "",
  childcareExperience: "",
  childcareYears: "",
  firstAidCertified: false,
  drivingLicense: false,
  targetCountries: [],
  availableFrom: "",
  availableTo: "",
  preferredDuration: "",
  isSmoker: false,
  healthDeclaration: "",
  hasCriminalRecord: false,
  description: "",
  motivation: "",
  phoneCountryCode: "",
  phoneNumber: "",
  phoneCountryCode2: "",
  phoneNumber2: "",
};

const MAX_ID_DOCUMENTS = 4;
const EXPERIENCE_YEARS = ["0", "1", "2", "3", "4", "5+"];

type SectionId = "personal" | "about" | "languages" | "experience" | "availability" | "contact" | "health" | "documents";

const SECTIONS: { id: SectionId; icon: LucideIcon; color: string }[] = [
  { id: "personal", icon: User, color: BLUE },
  { id: "about", icon: PenLine, color: ORANGE },
  { id: "languages", icon: Languages, color: TEAL },
  { id: "experience", icon: HeartHandshake, color: ORANGE },
  { id: "availability", icon: CalendarDays, color: INDIGO },
  { id: "contact", icon: MessageCircle, color: GREEN },
  { id: "health", icon: HeartPulse, color: TEAL },
  { id: "documents", icon: Lock, color: BLUE },
];

/** Champs du taux de complétion (mêmes que /api/dashboard/au-pair), avec la section où les renseigner */
type CompletionField = keyof typeof COMPLETION_SECTIONS;
const COMPLETION_SECTIONS = {
  profilePhotoUrl: "photo",
  gender: "personal",
  cityOfOrigin: "personal",
  educationLevel: "personal",
  description: "about",
  motivation: "about",
  childcareYears: "experience",
  childcareExperience: "experience",
  availableFrom: "availability",
  preferredDuration: "availability",
  phoneWhatsapp1: "contact",
} as const satisfies Record<string, SectionId | "photo">;

function isFilled(profile: Profile, field: CompletionField) {
  const value = field === "phoneWhatsapp1" ? profile.phoneNumber : profile[field];
  return String(value ?? "").trim() !== "";
}

/** Champs édités via le bouton "Enregistrer" (photo et documents sont envoyés immédiatement) */
const formSnapshot = (p: Profile) =>
  JSON.stringify({ ...p, status: undefined, profilePhotoUrl: undefined, idDocumentUrls: undefined });

const sectionDomId = (id: SectionId) => `profil-${id}`;

// Champs : 48px de haut et 16px de texte sur mobile (cible tactile, pas de zoom auto sur iOS)
const INPUT =
  "w-full h-12 sm:h-11 rounded-xl border border-gray-200 bg-white px-4 text-base sm:text-sm text-[#1A1A2E] placeholder:text-gray-400 focus:outline-none focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/25 transition [&::-webkit-date-and-time-value]:text-left";
const TEXTAREA =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base sm:text-sm text-[#1A1A2E] leading-relaxed placeholder:text-gray-400 focus:outline-none focus:border-[#E87722] focus:ring-2 focus:ring-[#E87722]/25 transition resize-y min-h-28";
const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed";

function Field({ label, htmlFor, hint, className = "", children }: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

/** Puce sélectionnable (langues, pays) */
function ChoiceChip({ checked, onChange, children }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 min-h-10 px-3.5 rounded-xl border text-sm cursor-pointer select-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#E87722]/40 ${
        checked
          ? "border-[#E87722] bg-[#FFF3E0] text-[#C75F12]"
          : "border-gray-200 bg-white text-gray-700 hover:border-[#E87722]/50"
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {checked && <Check size={15} strokeWidth={2} className="shrink-0" />}
      {children}
    </label>
  );
}

/** Ligne avec interrupteur, pour les champs oui / non */
function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 min-h-12 px-4 py-2.5 text-left text-sm text-[#1A1A2E] hover:bg-gray-50/80 transition-colors focus-visible:outline-none focus-visible:bg-[#FFF3E0]/60"
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#3FA45B]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </span>
    </button>
  );
}

function SwitchGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white/80 divide-y divide-gray-100 overflow-hidden">{children}</div>
  );
}

function Section({ id, title, subtitle, action, children }: {
  id: SectionId;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { icon, color } = SECTIONS.find((s) => s.id === id)!;
  return (
    <div id={sectionDomId(id)} className="scroll-mt-20">
      <Panel className="p-4 sm:p-6">
        <PanelHeader title={title} subtitle={subtitle} icon={icon} color={color} action={action} />
        {children}
      </Panel>
    </div>
  );
}

export default function AuPairProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [savedSnapshot, setSavedSnapshot] = useState(formSnapshot(EMPTY_PROFILE));
  const { origin: originCountries, host: hostCountries } = useCountries();
  const {
    languages: LANGUAGES,
    educationLevels: EDUCATION_LEVELS,
    durations: DURATIONS,
  } = useConstants();
  const allCountries = [...originCountries, ...hostCountries];
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState("");
  const [docError, setDocError] = useState("");
  const docInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const { t, tValue, tError } = useI18n();
  const tp = t.auPairProfile;
  const pf = t.profileForm;

  const dirty = formSnapshot(profile) !== savedSnapshot;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/au-pair")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) {
          setProfile(json);
          setSavedSnapshot(formSnapshot(json));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Avertit avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Section courante, mise en évidence dans le sommaire
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id.replace("profil-", "") as SectionId);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(sectionDomId(id));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loading]);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const toggleInList = (key: "languages" | "targetCountries", value: string, checked: boolean) => {
    setProfile((p) => ({
      ...p,
      [key]: checked ? [...p[key], value] : p[key].filter((v) => v !== value),
    }));
    setSaved(false);
  };

  const goToSection = (id: SectionId | "photo") => {
    if (id === "photo") {
      fileInputRef.current?.click();
      return;
    }
    setActiveSection(id);
    document.getElementById(sectionDomId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, profilePhotoUrl: data.url }));
      } else {
        setPhotoError(tError(data.error, pf.photoUploadError));
      }
    } catch {
      setPhotoError(pf.photoUploadError);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDocError("");
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetch("/api/profile/id-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, idDocumentUrls: data.idDocumentUrls }));
      } else {
        setDocError(tError(data.error, tp.docUploadError));
      }
    } catch {
      setDocError(tp.docUploadError);
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleDocDelete = async (url: string) => {
    setDocError("");
    setDeletingDoc(url);
    try {
      const res = await fetch("/api/profile/id-document", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, idDocumentUrls: data.idDocumentUrls }));
      } else {
        setDocError(tError(data.error, tp.docDeleteError));
      }
    } catch {
      setDocError(tp.docDeleteError);
    } finally {
      setDeletingDoc("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    const snapshot = formSnapshot(profile);
    try {
      const res = await fetch("/api/profile/au-pair", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSavedSnapshot(snapshot);
        setSaved(true);
      } else {
        const data = await res.json().catch(() => null);
        setSaveError(tError(data?.error, pf.saveError));
      }
    } catch {
      setSaveError(t.common.networkError);
    } finally {
      setSaving(false);
    }
  };

  const status: ProfileStatus = profile.status in STATUS_VARIANTS ? (profile.status as ProfileStatus) : "PENDING";
  const userName = profile.firstName ? `${profile.firstName} ${profile.lastName.charAt(0)}.` : "";

  if (loading) {
    return (
      <DashboardLayout role="au-pair" userName={userName}>
        <Panel className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">{pf.loading}</p>
        </Panel>
      </DashboardLayout>
    );
  }

  const completionFields = Object.keys(COMPLETION_SECTIONS) as CompletionField[];
  const missing = completionFields.filter((f) => !isFilled(profile, f));
  const completion = Math.round(((completionFields.length - missing.length) / completionFields.length) * 100);
  const completionColor = completion >= 80 ? GREEN : ORANGE;
  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const originFlag = originCountries.find((c) => c.name === profile.countryOfOrigin)?.flag;
  const location = [profile.cityOfOrigin, profile.countryOfOrigin && tValue(profile.countryOfOrigin)].filter(Boolean).join(", ");
  const sectionLabel = (id: SectionId) => tp.nav[id];

  const phoneFields = [
    { label: tp.whatsappMain, codeKey: "phoneCountryCode", numberKey: "phoneNumber", hint: tp.contactHint },
    { label: tp.whatsappSecondary, codeKey: "phoneCountryCode2", numberKey: "phoneNumber2" },
  ] as const;

  return (
    <DashboardLayout role="au-pair" userName={userName}>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader title={pf.title} subtitle={tp.subtitle} />

        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:items-start">
          {/* Carte d'identité du profil + sommaire */}
          <aside className="space-y-4 lg:sticky lg:top-20">
            <Panel className="p-4 sm:p-5" tint={completionColor}>
              <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => (profile.profilePhotoUrl ? setShowPhoto(true) : fileInputRef.current?.click())}
                    className="block w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-[0_8px_24px_-12px_rgba(30,53,112,0.5)] bg-gradient-to-br from-[#F08A3C] to-[#E87722] text-white text-2xl font-medium focus-visible:outline-none focus-visible:ring-[#E87722]/40"
                    aria-label={profile.profilePhotoUrl ? pf.viewPhoto : pf.uploadPhoto}
                  >
                    {profile.profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.profilePhotoUrl} alt={tp.photoTitle} className="w-full h-full object-cover object-top" />
                    ) : (
                      profile.firstName.charAt(0).toUpperCase()
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center ring-2 ring-white hover:bg-[#E87722] transition-colors disabled:opacity-60"
                    aria-label={profile.profilePhotoUrl ? tp.changePhoto : pf.uploadPhoto}
                    title={profile.profilePhotoUrl ? tp.changePhoto : pf.uploadPhoto}
                  >
                    {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} strokeWidth={1.5} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="min-w-0 flex-1 lg:w-full">
                  <p className="text-lg font-medium text-[#1A1A2E] truncate">
                    {profile.firstName} {profile.lastName}
                  </p>
                  {(age !== null || location) && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 lg:justify-center min-w-0">
                      {originFlag ? (
                        <CountryFlag flag={originFlag} className="h-3 w-auto rounded-[2px] shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {[age !== null && age > 0 ? t.common.age(age) : "", location].filter(Boolean).join(" · ")}
                      </span>
                    </p>
                  )}
                  <div className="mt-2">
                    <Badge variant={STATUS_VARIANTS[status]}>{t.profileStatus[status]}</Badge>
                  </div>
                </div>
              </div>

              {photoError && <p className="text-xs text-red-500 mt-3">{photoError}</p>}
              <p className="text-xs text-gray-500 mt-3 lg:text-center">{pf.photoHint}</p>

              {/* Complétion */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-sm text-gray-700">{tp.completionLabel}</span>
                  <span className="text-lg font-semibold tabular-nums" style={{ color: completionColor }}>
                    {completion}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: `${completionColor}1F` }}>
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${completion}%`, background: completionColor }}
                  />
                </div>
                {missing.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-500 mt-3 mb-2">{tp.completionMissing(missing.length)}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {missing.map((field) => (
                        <li key={field}>
                          <button
                            type="button"
                            onClick={() => goToSection(COMPLETION_SECTIONS[field])}
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-dashed border-gray-300 bg-white/70 text-xs text-gray-600 hover:border-[#E87722] hover:text-[#E87722] transition-colors"
                          >
                            <Plus size={12} strokeWidth={2} />
                            {t.auPairHome.missingFields[field]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-xs text-gray-600 mt-3 flex items-center gap-1.5">
                    <CheckCircle size={14} strokeWidth={1.5} className="text-[#3FA45B]" />
                    {tp.completionDone}
                  </p>
                )}
              </div>
            </Panel>

            {/* Sommaire : vertical sur grand écran */}
            <nav aria-label={tp.sectionsNav} className="hidden lg:block">
              <Panel className="p-2">
                <ul className="space-y-0.5">
                  {SECTIONS.map(({ id, icon: Icon, color }) => {
                    const active = activeSection === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => goToSection(id)}
                          aria-current={active ? "true" : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                            active ? "bg-[#FFF3E0] text-[#C75F12]" : "text-gray-600 hover:bg-gray-50 hover:text-[#1A1A2E]"
                          }`}
                        >
                          <Icon {...ICON} size={18} style={{ color: active ? undefined : color }} />
                          {sectionLabel(id)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </nav>
          </aside>

          <div className="space-y-4 sm:space-y-5 mt-4 lg:mt-0 min-w-0">
            {/* Sommaire : défilement horizontal sur mobile / tablette */}
            <nav aria-label={tp.sectionsNav} className="lg:hidden -mx-4 sm:-mx-6">
              <ul className="flex gap-2 overflow-x-auto px-4 sm:px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SECTIONS.map(({ id, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <li key={id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => goToSection(id)}
                        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-sm whitespace-nowrap transition-colors ${
                          active
                            ? "border-[#E87722] bg-[#E87722] text-white"
                            : "border-gray-200 bg-white/80 text-gray-600"
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.5} />
                        {sectionLabel(id)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Informations personnelles */}
            <Section id="personal" title={tp.personalInfo}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={pf.firstName} htmlFor="firstName">
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={profile.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label={pf.lastName} htmlFor="lastName">
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={profile.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label={tp.dateOfBirth} htmlFor="dateOfBirth">
                  <input
                    id="dateOfBirth"
                    type="date"
                    autoComplete="bday"
                    value={profile.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label={tp.genderRequired} htmlFor="gender">
                  <SelectField
                    id="gender"
                    value={profile.gender}
                    onChange={(v) => update("gender", v)}
                    placeholder={t.common.select}
                    options={[
                      { value: "Femme", label: tValue("Femme") },
                      { value: "Homme", label: tValue("Homme") },
                    ]}
                    triggerClassName="sm:h-11"
                  />
                </Field>
                <Field label={tp.nationality} htmlFor="nationality">
                  <input
                    id="nationality"
                    type="text"
                    value={profile.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label={tp.countryOfOrigin} htmlFor="countryOfOrigin">
                  <SelectField
                    id="countryOfOrigin"
                    value={profile.countryOfOrigin}
                    onChange={(v) => update("countryOfOrigin", v)}
                    placeholder={t.common.selectCountry}
                    options={originCountries.map((c) => ({ value: c.name, label: tValue(c.name) }))}
                    triggerClassName="sm:h-11"
                  />
                </Field>
                <Field label={tp.cityOfOrigin} htmlFor="cityOfOrigin">
                  <input
                    id="cityOfOrigin"
                    type="text"
                    autoComplete="address-level2"
                    value={profile.cityOfOrigin}
                    onChange={(e) => update("cityOfOrigin", e.target.value)}
                    className={INPUT}
                  />
                </Field>
                <Field label={tp.educationLevel} htmlFor="educationLevel">
                  <SelectField
                    id="educationLevel"
                    value={profile.educationLevel}
                    onChange={(v) => update("educationLevel", v)}
                    placeholder={t.common.select}
                    options={EDUCATION_LEVELS.map((level) => ({ value: String(level), label: tValue(level) }))}
                    triggerClassName="sm:h-11"
                  />
                </Field>
              </div>
            </Section>

            {/* Présentation & motivation */}
            <Section id="about" title={tp.descriptionMotivation} subtitle={tp.aboutHint}>
              <div className="space-y-4">
                <Field label={tp.personalPresentation} htmlFor="description">
                  <textarea
                    id="description"
                    rows={4}
                    value={profile.description}
                    onChange={(e) => update("description", e.target.value)}
                    className={TEXTAREA}
                  />
                </Field>
                <Field label={tp.whyAuPair} htmlFor="motivation">
                  <textarea
                    id="motivation"
                    rows={4}
                    value={profile.motivation}
                    onChange={(e) => update("motivation", e.target.value)}
                    className={TEXTAREA}
                  />
                </Field>
              </div>
            </Section>

            {/* Langues parlées */}
            <Section
              id="languages"
              title={tp.spokenLanguages}
              subtitle={tp.languagesHint}
              action={
                profile.languages.length > 0 ? (
                  <span className="text-xs text-gray-500 tabular-nums">{tp.selectedCount(profile.languages.length)}</span>
                ) : undefined
              }
            >
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <ChoiceChip
                    key={lang}
                    checked={profile.languages.includes(lang)}
                    onChange={(checked) => toggleInList("languages", lang, checked)}
                  >
                    {tValue(lang)}
                  </ChoiceChip>
                ))}
              </div>
            </Section>

            {/* Expérience & qualifications */}
            <Section id="experience" title={tp.experienceQualifications}>
              <div className="space-y-4">
                <fieldset>
                  <legend className="block text-sm text-gray-700 mb-1.5">{tp.experienceYears}</legend>
                  <div className="grid grid-cols-6 gap-1.5 sm:max-w-sm" role="radiogroup">
                    {EXPERIENCE_YEARS.map((n) => {
                      const selected = profile.childcareYears === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => update("childcareYears", n)}
                          className={`h-11 rounded-xl border text-sm tabular-nums transition-colors ${
                            selected
                              ? "border-[#E87722] bg-[#E87722] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#E87722]/50"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label={tp.describeExperience} htmlFor="childcareExperience">
                  <textarea
                    id="childcareExperience"
                    rows={4}
                    value={profile.childcareExperience}
                    onChange={(e) => update("childcareExperience", e.target.value)}
                    className={TEXTAREA}
                  />
                </Field>
                <SwitchGroup>
                  <SwitchRow
                    label={tp.firstAidCertified}
                    checked={profile.firstAidCertified}
                    onChange={(v) => update("firstAidCertified", v)}
                  />
                  <SwitchRow
                    label={tp.drivingLicense}
                    checked={profile.drivingLicense}
                    onChange={(v) => update("drivingLicense", v)}
                  />
                </SwitchGroup>
              </div>
            </Section>

            {/* Disponibilité & destination */}
            <Section id="availability" title={tp.availability}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <Field label={tp.availableFrom} htmlFor="availableFrom">
                    <input
                      id="availableFrom"
                      type="date"
                      value={profile.availableFrom}
                      onChange={(e) => update("availableFrom", e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                  <Field label={tp.availableTo} htmlFor="availableTo">
                    <input
                      id="availableTo"
                      type="date"
                      min={profile.availableFrom || undefined}
                      value={profile.availableTo}
                      onChange={(e) => update("availableTo", e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                  <Field label={tp.preferredDuration} htmlFor="preferredDuration" className="col-span-2 sm:col-span-1">
                    <SelectField
                      id="preferredDuration"
                      value={profile.preferredDuration}
                      onChange={(v) => update("preferredDuration", v)}
                      placeholder={t.common.select}
                      options={DURATIONS.map((d) => ({ value: String(d), label: tValue(d) }))}
                      triggerClassName="sm:h-11"
                    />
                  </Field>
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <p className="text-sm text-gray-700">{tp.targetCountries}</p>
                    {profile.targetCountries.length > 0 && (
                      <span className="text-xs text-gray-500 tabular-nums shrink-0">
                        {tp.selectedCount(profile.targetCountries.length)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hostCountries.map(({ name, flag }) => (
                      <ChoiceChip
                        key={name}
                        checked={profile.targetCountries.includes(name)}
                        onChange={(checked) => toggleInList("targetCountries", name, checked)}
                      >
                        {flag && <CountryFlag flag={flag} className="h-3.5 w-auto rounded-[2px] shrink-0" />}
                        {tValue(name)}
                      </ChoiceChip>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Contact WhatsApp */}
            <Section id="contact" title={pf.whatsappTitle}>
              <div className="space-y-4">
                {phoneFields.map(({ label, codeKey, numberKey, ...rest }) => (
                  <Field key={numberKey} label={label} htmlFor={numberKey} hint={"hint" in rest ? rest.hint : undefined}>
                    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] sm:grid-cols-[11rem_minmax(0,1fr)] gap-2">
                      <SelectField
                        aria-label={label}
                        value={profile[codeKey]}
                        onChange={(v) => update(codeKey, v)}
                        options={allCountries.map((c) => ({ value: c.dialCode, label: `${c.dialCode} · ${tValue(c.name)}` }))}
                        triggerClassName="sm:h-11"
                      />
                      <input
                        id={numberKey}
                        type="tel"
                        inputMode="tel"
                        autoComplete={numberKey === "phoneNumber" ? "tel-national" : "off"}
                        value={formatPhoneDigits(profile[numberKey])}
                        onChange={(e) => update(numberKey, formatPhoneDigits(e.target.value))}
                        className={INPUT}
                        placeholder="01 02 03 04 05"
                      />
                    </div>
                  </Field>
                ))}
              </div>
            </Section>

            {/* Santé & déclarations */}
            <Section id="health" title={tp.healthDeclarations} subtitle={tp.healthHint}>
              <div className="space-y-4">
                <SwitchGroup>
                  <SwitchRow label={tp.smoker} checked={profile.isSmoker} onChange={(v) => update("isSmoker", v)} />
                  <SwitchRow
                    label={tp.criminalRecord}
                    checked={profile.hasCriminalRecord}
                    onChange={(v) => update("hasCriminalRecord", v)}
                  />
                </SwitchGroup>
                <Field label={tp.healthDeclaration} htmlFor="healthDeclaration">
                  <textarea
                    id="healthDeclaration"
                    rows={3}
                    value={profile.healthDeclaration}
                    onChange={(e) => update("healthDeclaration", e.target.value)}
                    className={TEXTAREA}
                  />
                </Field>
              </div>
            </Section>

            {/* Pièce d'identité (envoi immédiat, visible uniquement par l'équipe) */}
            <Section
              id="documents"
              title={tp.idTitle}
              subtitle={profile.idDocumentUrls.length > 0 ? tp.docsSent(profile.idDocumentUrls.length) : tp.noDocs}
              action={
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[#3A5BA8]/10 text-[11px] text-[#3A5BA8]">
                  <Lock size={12} strokeWidth={1.5} />
                  {tp.privateBadge}
                </span>
              }
            >
              <p className="text-xs text-gray-500 mb-4">{tp.idHint}</p>
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.idDocumentUrls.map((url, i) => (
                  <li key={url} className="relative">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border border-gray-100 bg-white/80 p-3 text-center hover:border-[#3A5BA8]/30 hover:shadow-[0_8px_24px_-16px_rgba(30,53,112,0.5)] transition-all"
                    >
                      <span className="w-11 h-11 rounded-xl bg-[#3A5BA8]/10 text-[#3A5BA8] flex items-center justify-center">
                        <FileText {...ICON} />
                      </span>
                      <span className="text-sm text-[#1A1A2E]">{tp.documentN(i + 1)}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        {tp.openDocument}
                        <ExternalLink size={12} strokeWidth={1.5} />
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDocDelete(url)}
                      disabled={deletingDoc === url}
                      className="absolute top-1 right-1 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      title={t.common.delete}
                      aria-label={`${t.common.delete} — ${tp.documentN(i + 1)}`}
                    >
                      {deletingDoc === url ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.5} />}
                    </button>
                  </li>
                ))}
                {profile.idDocumentUrls.length < MAX_ID_DOCUMENTS && (
                  <li>
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      disabled={uploadingDoc}
                      className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white/50 p-3 text-sm text-gray-600 hover:border-[#E87722] hover:text-[#E87722] transition-colors disabled:opacity-60"
                    >
                      {uploadingDoc ? <Loader2 {...ICON} className="animate-spin" /> : <Plus {...ICON} />}
                      <span>{uploadingDoc ? pf.uploading : tp.addDocuments}</span>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {tp.docsCount(profile.idDocumentUrls.length, MAX_ID_DOCUMENTS)}
                      </span>
                    </button>
                  </li>
                )}
              </ul>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleDocChange}
              />
              {docError && <p className="text-xs text-red-500 mt-3">{docError}</p>}
            </Section>
          </div>
        </div>

        {/* Barre d'enregistrement collée en bas de l'écran (zone de sécurité iOS incluse) */}
        <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/85 backdrop-blur-md border-t border-white shadow-[0_-8px_24px_-16px_rgba(30,53,112,0.35)]">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <p className="flex-1 min-w-0 text-xs sm:text-sm flex items-center gap-2" aria-live="polite">
              {saveError ? (
                <span className="text-red-500">{saveError}</span>
              ) : dirty ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#E87722] shrink-0" />
                  <span className="text-[#C75F12] truncate">{tp.unsavedChanges}</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle size={16} strokeWidth={1.5} className="text-[#3FA45B] shrink-0" />
                  <span className="text-[#2E7D46] truncate">{pf.saved}</span>
                </>
              ) : (
                <span className="text-gray-500 truncate">{tp.upToDate}</span>
              )}
            </p>
            <button type="button" onClick={handleSave} disabled={saving || !dirty} className={`${PRIMARY_BUTTON} shrink-0`}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span className="sm:hidden">{saving ? pf.saving : tp.save}</span>
              <span className="hidden sm:inline">{saving ? pf.saving : pf.saveChanges}</span>
            </button>
          </div>
        </div>
      </div>

      {showPhoto && profile.profilePhotoUrl && (
        <PhotoViewerModal url={profile.profilePhotoUrl} onClose={() => setShowPhoto(false)} />
      )}
    </DashboardLayout>
  );
}
