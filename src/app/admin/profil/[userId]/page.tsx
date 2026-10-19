"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import {
  ArrowLeft,
  CheckCircle,
  X,
  Loader2,
  Maximize2,
  MapPin,
  Mail,
  Phone,
  CalendarDays,
  Cake,
  UserRound,
  Baby,
  Plane,
  HeartPulse,
  MessageSquareText,
  FileText,
  ListChecks,
  History,
  House,
  BriefcaseBusiness,
  UserSearch,
  ClipboardCheck,
  Eye,
  EyeOff,
  CreditCard,
  BadgeCheck,
  Ban,
  RotateCcw,
  ExternalLink,
  ImageOff,
  type LucideIcon,
} from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/i18n";
import { formatPhoneNumber } from "@/lib/phone";
import {
  BLUE,
  GREEN,
  ICON,
  INDIGO,
  ORANGE,
  PAGE_TITLE,
  TEAL,
  KpiGrid,
  Panel,
  PanelHeader,
  type KpiItem,
} from "@/components/admin/AdminUI";

type ProfileStatus = "PENDING" | "ACTIVE" | "HIDDEN" | "SUSPENDED" | "DELETED";
type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED";

type CommonDetail = {
  email: string;
  memberSince: string;
  status: string;
  profileViews: number;
  validatedAt: string | null;
  updatedAt: string;
  completion: number;
  missingFields: string[];
};

type AuPairDetail = CommonDetail & {
  role: "AU_PAIR";
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfOrigin: string;
  cityOfOrigin: string | null;
  languages: string[];
  educationLevel: string | null;
  childcareExperience: string | null;
  childcareYears: number | null;
  firstAidCertified: boolean;
  drivingLicense: boolean;
  targetCountries: string[];
  availableFrom: string | null;
  availableTo: string | null;
  preferredDuration: string | null;
  isSmoker: boolean;
  healthDeclaration: string | null;
  hasCriminalRecord: boolean;
  description: string | null;
  motivation: string | null;
  phoneWhatsapp1: string | null;
  phoneWhatsapp2: string | null;
  profilePhotoUrl: string | null;
  idDocumentUrls: string[];
  isAvailable: boolean;
  subscription: { status: SubscriptionStatus; expiresAt: string; amount: number; currency: string } | null;
};

type FamilyDetail = CommonDetail & {
  role: "FAMILLE";
  name: string | null;
  country: string;
  city: string;
  address: string | null;
  maritalStatus: string;
  parentsAges: number[];
  numberOfKids: number;
  kidsAges: number[];
  auPairTasks: string | null;
  hoursPerWeek: number | null;
  pocketMoney: number | null;
  accommodation: string | null;
  mealsProvided: boolean;
  description: string | null;
  familyPhotoUrl: string | null;
  phoneWhatsapp: string | null;
  preferredGender: string | null;
  preferredAgeMin: number | null;
  preferredAgeMax: number | null;
  preferredLanguages: string[];
};

type ProfileDetail = AuPairDetail | FamilyDetail;

type Action = "validate" | "hide" | "unhide" | "suspend";

const STATUS_VARIANTS: Record<ProfileStatus, "warning" | "success" | "secondary" | "destructive"> = {
  PENDING: "warning",
  ACTIVE: "success",
  HIDDEN: "secondary",
  SUSPENDED: "destructive",
  DELETED: "destructive",
};

const DAY_MS = 24 * 60 * 60 * 1000;

function Field({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <div className="text-sm text-[#1A1A2E] break-words">{value || <span className="text-gray-300">—</span>}</div>
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

/** Texte libre saisi par l'utilisateur, dans un encart doux */
function LongText({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="mt-4">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <p className="text-sm text-[#1A1A2E] leading-relaxed whitespace-pre-wrap bg-white/70 border border-gray-100 rounded-xl p-3.5">
        {text}
      </p>
    </div>
  );
}

function YesNo({ value }: { value: boolean }) {
  const { t } = useI18n();
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> {t.adminCommon.yes}</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400"><X className="w-4 h-4" /> {t.adminCommon.no}</span>
  );
}

function Section({ title, icon, color, children }: { title: string; icon: LucideIcon; color: string; children: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <PanelHeader title={title} icon={icon} color={color} />
      {children}
    </Panel>
  );
}

/** Déclaration sur l'honneur : un « oui » mérite l'attention de l'admin */
function Declaration({ label, value }: { label: string; value: boolean }) {
  const { t } = useI18n();
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          value ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
        }`}
      >
        {value ? t.adminCommon.yes : t.adminCommon.no}
      </span>
    </li>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, disabled }: {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm border bg-white/80 transition-colors hover:bg-white disabled:opacity-50"
      style={{ color, borderColor: `${color}40` }}
    >
      <Icon size={16} strokeWidth={ICON.strokeWidth} />
      {label}
    </button>
  );
}

function ContactLine({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-2.5 min-w-0">
      <Icon size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400 shrink-0" />
      <div className="text-sm text-[#1A1A2E] min-w-0 truncate">{children}</div>
    </li>
  );
}

function DocumentLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white/70 hover:border-[#E87722]/40 hover:bg-white transition-colors"
    >
      <span className="w-9 h-9 rounded-lg bg-[#FFF3E0] text-[#E87722] flex items-center justify-center shrink-0">
        <FileText size={18} strokeWidth={ICON.strokeWidth} />
      </span>
      <span className="text-sm text-[#1A1A2E] flex-1 truncate">{label}</span>
      <ExternalLink size={15} strokeWidth={ICON.strokeWidth} className="text-gray-400 shrink-0" />
    </a>
  );
}

const whatsappLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

export default function AdminProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") === "FAMILLE" ? "FAMILLE" : "AU_PAIR";

  const [data, setData] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const { t, locale, tValue, relativeDate } = useI18n();
  const c = t.adminCommon;
  const tp = t.adminProfile;
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  const flagMap = Object.fromEntries([...originCountries, ...hostCountries].map((c) => [c.name, c.flag]));

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/profile/${userId}?role=${role}`);
    if (!res.ok) throw new Error();
    setData(await res.json());
  }, [userId, role]);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const performAction = async (action: Action) => {
    setProcessing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, action }),
      });
      if (!res.ok) throw new Error();
      // Recharge le profil : le statut et la date de validation viennent du serveur
      await load();
      setFeedback({ ok: true, text: tp.statusUpdated });
    } catch {
      setFeedback({ ok: false, text: c.editError });
    } finally {
      setProcessing(false);
      setConfirmSuspend(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    gender: tp.gender,
    cityOfOrigin: tp.cityOfOrigin,
    educationLevel: tp.educationLevel,
    childcareExperience: tp.childcareExperience,
    childcareYears: tp.yearsOfExperience,
    preferredDuration: tp.preferredDuration,
    description: tp.description,
    motivation: tp.motivation,
    phoneWhatsapp1: "WhatsApp",
    phoneWhatsapp: "WhatsApp",
    profilePhotoUrl: tp.profilePhoto,
    availableFrom: tp.availableFrom,
    address: tp.address,
    auPairTasks: tp.tasks,
    hoursPerWeek: tp.hoursPerWeek,
    pocketMoney: tp.pocketMoney,
    accommodation: tp.accommodation,
    familyPhotoUrl: tp.familyPhoto,
    preferredGender: tp.preferredGender,
    preferredLanguages: tp.preferredLanguages,
  };

  const renderBody = (data: ProfileDetail) => {
    const isAuPair = data.role === "AU_PAIR";
    const accent = isAuPair ? ORANGE : BLUE;
    const status = data.status as ProfileStatus;
    const statusBadge = data.status in STATUS_VARIANTS
      ? { variant: STATUS_VARIANTS[status], label: c.profileStatus[status] }
      : { variant: "secondary" as const, label: data.status };
    const photoUrl = isAuPair ? data.profilePhotoUrl : data.familyPhotoUrl;
    const displayName = isAuPair ? `${data.firstName} ${data.lastName}` : data.name ?? tp.familyFallback;
    const country = isAuPair ? data.countryOfOrigin : data.country;
    const city = isAuPair ? data.cityOfOrigin : data.city;
    const phones = (isAuPair ? [data.phoneWhatsapp1, data.phoneWhatsapp2] : [data.phoneWhatsapp]).filter(
      (p): p is string => !!p,
    );

    // KPI : complétion, vues, abonnement (au pair) ou enfants (famille), validation
    const subscriptionKpi: KpiItem = isAuPair
      ? (() => {
          const sub = data.subscription;
          const daysLeft = sub?.status === "ACTIVE" ? Math.max(0, Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / DAY_MS)) : 0;
          return {
            icon: CreditCard,
            value: sub ? t.adminPayments.statuses[sub.status] : "—",
            label: tp.kpiSubscription,
            caption: !sub ? tp.noSubscription : sub.status === "ACTIVE" ? tp.subscriptionUntil(formatDate(sub.expiresAt)) : tp.subscriptionEnded(formatDate(sub.expiresAt)),
            ratio: Math.round((daysLeft / 30) * 100),
            color: TEAL,
          };
        })()
      : {
          icon: Baby,
          value: data.numberOfKids,
          label: tp.numberOfKids,
          caption: data.kidsAges.length > 0 ? `${tp.kidsAges} : ${data.kidsAges.join(", ")}` : undefined,
          ratio: 100,
          color: TEAL,
        };
    const kpis: KpiItem[] = [
      { icon: ClipboardCheck, value: `${data.completion}%`, label: tp.kpiCompletion, caption: tp.missingCount(data.missingFields.length), ratio: data.completion, color: GREEN },
      { icon: Eye, value: data.profileViews, label: tp.kpiViews, caption: tp.viewsCaption, ratio: 100, color: INDIGO },
      subscriptionKpi,
      {
        icon: BadgeCheck,
        value: statusBadge.label,
        label: tp.kpiValidation,
        caption: data.validatedAt ? tp.validatedOn(formatDate(data.validatedAt)) : `${tp.notValidated} · ${tp.waitingSince(relativeDate(data.memberSince))}`,
        ratio: status === "ACTIVE" ? 100 : status === "PENDING" ? 50 : 0,
        color: ORANGE,
      },
    ];

    const actions: { action: Action; icon: LucideIcon; label: string; color: string }[] = [];
    if (status === "PENDING") actions.push({ action: "validate", icon: CheckCircle, label: c.validate, color: GREEN });
    if (status === "ACTIVE") actions.push({ action: "hide", icon: EyeOff, label: c.hide, color: INDIGO });
    if (status === "HIDDEN") actions.push({ action: "unhide", icon: Eye, label: c.unhide, color: INDIGO });
    if (status === "SUSPENDED") actions.push({ action: "unhide", icon: RotateCcw, label: tp.reactivate, color: GREEN });
    else if (status !== "DELETED") actions.push({ action: "suspend", icon: Ban, label: c.suspend, color: "#DC2626" });

    return (
      <>
        {/* En-tête */}
        <Panel tint={accent} className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              type="button"
              onClick={() => photoUrl && setShowPhoto(true)}
              disabled={!photoUrl}
              title={photoUrl ? c.viewPhoto : undefined}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 ring-4 ring-white shadow-md flex items-center justify-center text-white text-3xl font-medium self-start"
              style={{ background: accent }}
            >
              {photoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </>
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className={`${PAGE_TITLE} flex items-center gap-2`}>
                    <span className="truncate">{displayName}</span>
                    {flagMap[country] && <span className="text-2xl leading-none">{flagMap[country]}</span>}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={isAuPair ? "default" : "secondary"}>{isAuPair ? c.roleAuPair : c.roleFamily}</Badge>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    {isAuPair && (
                      <Badge variant={data.isAvailable ? "success" : "warning"}>
                        {data.isAvailable ? tp.available : tp.unavailable}
                      </Badge>
                    )}
                  </div>
                </div>
                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((a) => (
                      <ActionButton
                        key={a.action + a.label}
                        icon={a.icon}
                        label={a.label}
                        color={a.color}
                        disabled={processing}
                        onClick={() => (a.action === "suspend" ? setConfirmSuspend(true) : performAction(a.action))}
                      />
                    ))}
                  </div>
                )}
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-600">
                <li className="flex items-center gap-1.5">
                  <MapPin size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400" />
                  {[city, tValue(country)].filter(Boolean).join(", ")}
                </li>
                {isAuPair ? (
                  <li className="flex items-center gap-1.5">
                    <Cake size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400" />
                    {tp.ageValue(data.age)}
                  </li>
                ) : (
                  <li className="flex items-center gap-1.5">
                    <Baby size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400" />
                    {tp.kidsCount(data.numberOfKids)} · {t.maritalStatus[data.maritalStatus as keyof typeof t.maritalStatus] ?? data.maritalStatus}
                  </li>
                )}
                <li className="flex items-center gap-1.5 min-w-0">
                  <Mail size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400 shrink-0" />
                  <a href={`mailto:${data.email}`} className="hover:text-[#E87722] truncate">{data.email}</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <CalendarDays size={16} strokeWidth={ICON.strokeWidth} className="text-gray-400" />
                  {tp.memberSince} {formatDate(data.memberSince)}
                </li>
              </ul>

              {feedback && (
                <p className={`mt-3 text-sm ${feedback.ok ? "text-green-600" : "text-red-600"}`}>{feedback.text}</p>
              )}
            </div>
          </div>
        </Panel>

        <KpiGrid items={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {isAuPair ? (
              <>
                <Section title={tp.general} icon={UserRound} color={ORANGE}>
                  <FieldGrid>
                    <Field label={tp.dateOfBirth} value={`${formatDate(data.dateOfBirth)} (${tp.ageValue(data.age)})`} />
                    <Field label={tp.gender} value={tValue(data.gender)} />
                    <Field label={tp.nationality} value={data.nationality} />
                    <Field label={tp.countryOfOrigin} value={`${flagMap[data.countryOfOrigin] ?? ""} ${tValue(data.countryOfOrigin)}`.trim()} />
                    <Field label={tp.cityOfOrigin} value={data.cityOfOrigin} />
                    <Field label={tp.educationLevel} value={tValue(data.educationLevel)} />
                    <Field label={tp.languages} value={data.languages.length > 0 && <Chips items={data.languages.map(tValue)} />} wide />
                  </FieldGrid>
                </Section>

                <Section title={tp.experience} icon={Baby} color={TEAL}>
                  <FieldGrid>
                    <Field label={tp.yearsOfExperience} value={data.childcareYears != null ? tp.experienceYears(data.childcareYears) : null} />
                    <Field label={tp.firstAid} value={<YesNo value={data.firstAidCertified} />} />
                    <Field label={tp.drivingLicense} value={<YesNo value={data.drivingLicense} />} />
                  </FieldGrid>
                  <LongText label={tp.childcareExperience} text={data.childcareExperience} />
                </Section>

                <Section title={tp.availability} icon={Plane} color={BLUE}>
                  <FieldGrid>
                    <Field
                      label={tp.targetCountries}
                      value={data.targetCountries.length > 0 && (
                        <Chips items={data.targetCountries.map((country) => `${flagMap[country] ?? ""} ${tValue(country)}`.trim())} />
                      )}
                      wide
                    />
                    <Field label={tp.preferredDuration} value={tValue(data.preferredDuration)} />
                    <Field label={tp.availableFrom} value={data.availableFrom ? formatDate(data.availableFrom) : null} />
                    <Field label={tp.availableTo} value={data.availableTo ? formatDate(data.availableTo) : null} />
                  </FieldGrid>
                </Section>

                {(data.description || data.motivation) && (
                  <Section title={tp.presentation} icon={MessageSquareText} color={INDIGO}>
                    <div className="-mt-4">
                      <LongText label={tp.description} text={data.description} />
                      <LongText label={tp.motivation} text={data.motivation} />
                    </div>
                  </Section>
                )}
              </>
            ) : (
              <>
                <Section title={tp.general} icon={House} color={BLUE}>
                  <FieldGrid>
                    <Field label={tp.country} value={`${flagMap[data.country] ?? ""} ${tValue(data.country)}`.trim()} />
                    <Field label={tp.city} value={data.city} />
                    <Field label={tp.address} value={data.address} wide />
                    <Field label={tp.maritalStatus} value={t.maritalStatus[data.maritalStatus as keyof typeof t.maritalStatus] ?? data.maritalStatus} />
                    <Field label={tp.parentsAges} value={data.parentsAges.join(", ")} />
                  </FieldGrid>
                </Section>

                <Section title={tp.children} icon={Baby} color={TEAL}>
                  <FieldGrid>
                    <Field label={tp.numberOfKids} value={data.numberOfKids} />
                    <Field label={tp.kidsAges} value={data.kidsAges.length > 0 && <Chips items={data.kidsAges.map((age) => tp.ageValue(age))} />} />
                  </FieldGrid>
                </Section>

                <Section title={tp.conditions} icon={BriefcaseBusiness} color={ORANGE}>
                  <FieldGrid>
                    <Field label={tp.hoursPerWeek} value={data.hoursPerWeek != null ? `${data.hoursPerWeek} h` : null} />
                    <Field label={tp.pocketMoney} value={data.pocketMoney != null ? `${data.pocketMoney} €` : null} />
                    <Field label={tp.accommodation} value={data.accommodation} />
                    <Field label={tp.mealsProvided} value={<YesNo value={data.mealsProvided} />} />
                  </FieldGrid>
                  <LongText label={tp.tasks} text={data.auPairTasks} />
                </Section>

                <Section title={tp.wantedAuPair} icon={UserSearch} color={INDIGO}>
                  <FieldGrid>
                    <Field label={tp.preferredGender} value={data.preferredGender ? tValue(data.preferredGender) : null} />
                    <Field
                      label={tp.ageRange}
                      value={data.preferredAgeMin != null && data.preferredAgeMax != null ? tp.ageRangeValue(data.preferredAgeMin, data.preferredAgeMax) : null}
                    />
                    <Field label={tp.preferredLanguages} value={data.preferredLanguages.length > 0 && <Chips items={data.preferredLanguages.map(tValue)} />} wide />
                  </FieldGrid>
                </Section>

                {data.description && (
                  <Section title={tp.presentation} icon={MessageSquareText} color={GREEN}>
                    <div className="-mt-4">
                      <LongText label={tp.description} text={data.description} />
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-5">
            <Section title={tp.contact} icon={Phone} color={GREEN}>
              <ul className="divide-y divide-gray-100 -my-2.5">
                <ContactLine icon={Mail}>
                  <a href={`mailto:${data.email}`} className="hover:text-[#E87722]">{data.email}</a>
                </ContactLine>
                {phones.length > 0 ? (
                  phones.map((phone) => (
                    <ContactLine key={phone} icon={Phone}>
                      <a href={whatsappLink(phone)} target="_blank" rel="noreferrer" className="hover:text-[#E87722]">
                        {formatPhoneNumber(phone)} <span className="text-xs text-gray-400">· WhatsApp</span>
                      </a>
                    </ContactLine>
                  ))
                ) : (
                  <ContactLine icon={Phone}><span className="text-gray-300">—</span></ContactLine>
                )}
              </ul>
            </Section>

            <Section title={tp.documents} icon={FileText} color={ORANGE}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">{isAuPair ? tp.profilePhoto : tp.familyPhoto}</p>
                  {photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setShowPhoto(true)}
                      className="group relative block w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs bg-black/60 text-white rounded-lg px-2 py-1 opacity-90 group-hover:opacity-100">
                        <Maximize2 className="w-3 h-3" /> {c.viewPhoto}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl p-3">
                      <ImageOff size={16} strokeWidth={ICON.strokeWidth} /> {tp.noPhoto}
                    </div>
                  )}
                </div>
                {isAuPair && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">{tp.idDocument}</p>
                    {data.idDocumentUrls.length > 0 ? (
                      <div className="space-y-2">
                        {data.idDocumentUrls.map((url, i) => (
                          <DocumentLink
                            key={url}
                            href={url}
                            label={tp.viewDocument(data.idDocumentUrls.length > 1 ? String(i + 1) : "").trim()}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl p-3">
                        <FileText size={16} strokeWidth={ICON.strokeWidth} /> {tp.noDocument}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>

            {isAuPair && (
              <Section title={tp.declarations} icon={HeartPulse} color={INDIGO}>
                <ul className="divide-y divide-gray-100 -my-2.5">
                  <Declaration label={tp.smoker} value={data.isSmoker} />
                  <Declaration label={tp.criminalRecord} value={data.hasCriminalRecord} />
                </ul>
                <LongText label={tp.healthDeclaration} text={data.healthDeclaration} />
              </Section>
            )}

            {data.missingFields.length > 0 && (
              <Section title={tp.missingTitle} icon={ListChecks} color={ORANGE}>
                <Chips items={data.missingFields.map((f) => fieldLabels[f] ?? f)} tone="warning" />
              </Section>
            )}

            <Section title={tp.activity} icon={History} color={BLUE}>
              <ul className="divide-y divide-gray-100 -my-2.5 text-sm">
                <li className="flex justify-between gap-3 py-2.5">
                  <span className="text-gray-500">{tp.lastUpdate}</span>
                  <span className="text-[#1A1A2E] text-right">{relativeDate(data.updatedAt)}</span>
                </li>
                <li className="flex justify-between gap-3 py-2.5">
                  <span className="text-gray-500">{tp.kpiValidation}</span>
                  <span className="text-[#1A1A2E] text-right">{data.validatedAt ? formatDate(data.validatedAt) : tp.notValidated}</span>
                </li>
                <li className="flex justify-between gap-3 py-2.5">
                  <span className="text-gray-500">{tp.memberSince}</span>
                  <span className="text-[#1A1A2E] text-right">{formatDate(data.memberSince)}</span>
                </li>
              </ul>
            </Section>
          </div>
        </div>

        {confirmSuspend && (
          <ConfirmDialog
            title={tp.suspendTitle}
            description={tp.suspendText(displayName)}
            confirmLabel={c.suspend}
            loading={processing}
            onConfirm={() => performAction("suspend")}
            onCancel={() => setConfirmSuspend(false)}
          />
        )}

        {showPhoto && photoUrl && <PhotoViewerModal url={photoUrl} onClose={() => setShowPhoto(false)} />}
      </>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {c.back}
        </button>

        {loading ? (
          <Panel className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </Panel>
        ) : error || !data ? (
          <Panel className="p-12 text-center">
            <p className="text-gray-500">{tp.loadError}</p>
          </Panel>
        ) : (
          renderBody(data)
        )}
      </div>
    </AdminLayout>
  );
}

function Chips({ items, tone = "neutral" }: { items: string[]; tone?: "neutral" | "warning" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className={`text-xs px-2.5 py-1 rounded-full ${
            tone === "warning" ? "bg-[#FFF3E0] text-[#B85A12]" : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
