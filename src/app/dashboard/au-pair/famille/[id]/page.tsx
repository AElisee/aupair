"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft, Baby, Check, CheckCircle, Clock, FileText, Home, Lock, MapPin, Maximize2,
  MessageCircle, Phone, Sparkles, Users, Wallet, X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CountryFlag } from "@/components/ui/CountryFlag";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import { BLUE, GREEN, ICON, INDIGO, ORANGE, TEAL, Panel, PanelHeader } from "@/components/admin/AdminUI";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/i18n";
import { formatPhoneNumber } from "@/lib/phone";

type FamilyProfile = {
  locked: boolean;
  name: string;
  familyPhotoUrl: string;
  country: string;
  city: string;
  numberOfKids: number;
  kidsAges: number[];
  hoursPerWeek: number | null;
  pocketMoney: number | null;
  address?: string | null;
  maritalStatus?: string;
  parentsAges?: number[];
  auPairTasks?: string | null;
  accommodation?: string | null;
  mealsProvided?: boolean;
  description?: string | null;
  phoneWhatsapp?: string | null;
  preferredGender?: string | null;
  preferredAgeMin?: number | null;
  preferredAgeMax?: number | null;
  preferredLanguages?: string[];
};

const SEARCH_HREF = "/dashboard/au-pair/recherche";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm text-white bg-gradient-to-r from-[#F08A3C] to-[#E87722] shadow-[0_6px_16px_-6px_rgba(232,119,34,0.7)] hover:brightness-105 transition";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm border border-gray-200 bg-white/80 text-[#1A1A2E] hover:border-[#E87722]/40 transition";

/** Tuile libellé / valeur */
function Detail({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/70 border border-gray-100 px-4 py-3 min-w-0 ${className}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm text-[#1A1A2E] mt-0.5 break-words">{children || "—"}</div>
    </div>
  );
}

/** Chiffre clé de l'en-tête (enfants, heures, argent de poche) */
function Fact({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: React.ReactNode; color: string }) {
  return (
    <div
      className="rounded-xl border px-3 py-2.5 min-w-0"
      style={{ backgroundColor: `${color}12`, borderColor: `${color}2E` }}
    >
      <p className="flex items-center gap-1.5 text-[11px] sm:text-xs truncate" style={{ color }}>
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span className="truncate">{label}</span>
      </p>
      <p className="text-base sm:text-lg font-semibold text-[#1A1A2E] tabular-nums leading-tight mt-0.5 truncate">{value}</p>
    </div>
  );
}

function Chips({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="inline-flex items-center h-7 px-2.5 rounded-lg text-xs"
          style={{ backgroundColor: `${color}14`, color }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function YesNo({ value }: { value: boolean }) {
  const { t } = useI18n();
  return value ? (
    <span className="inline-flex items-center gap-1.5 text-[#3FA45B]"><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> {t.common.yes}</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-gray-400"><X className="w-4 h-4" strokeWidth={1.5} /> {t.common.no}</span>
  );
}

function FamilyPhoto({ data, onOpen }: { data: FamilyProfile; onOpen: () => void }) {
  const { t } = useI18n();
  const frame = "relative w-full sm:w-48 aspect-[4/3] sm:aspect-square shrink-0 rounded-2xl overflow-hidden";
  if (!data.familyPhotoUrl) {
    return (
      <div className={`${frame} flex items-center justify-center bg-gradient-to-br from-[#5B7BC8] to-[#3A5BA8]`}>
        <span className="text-5xl font-medium text-white">{data.name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <button type="button" onClick={onOpen} className={`${frame} group`} aria-label={t.familyDetail.enlargePhoto} title={t.familyDetail.enlargePhoto}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={data.familyPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500" />
      <span className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <Panel className="p-5">
      <div className="flex flex-col sm:flex-row gap-5 animate-pulse">
        <div className="w-full sm:w-48 aspect-[4/3] sm:aspect-square rounded-2xl bg-gray-200/70" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-6 w-1/2 rounded-lg bg-gray-200/70" />
          <div className="h-4 w-1/3 rounded-lg bg-gray-200/70" />
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-200/70" />)}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const { host: hostCountries } = useCountries();
  const { t, tValue } = useI18n();
  const td = t.familyDetail;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/families/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // On arrive ici depuis l'accueil, la recherche, les messages ou une notification : retour à la page précédente
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(SEARCH_HREF);
  };

  const chatHref = `/dashboard/au-pair/messages?userId=${id}`;
  const flag = data ? hostCountries.find((c) => c.name === data.country)?.flag : undefined;

  const actions = data && (
    <>
      <Link href={chatHref} className={`${PRIMARY_BUTTON} flex-1 md:flex-none`}>
        <MessageCircle {...ICON} size={16} />
        {t.common.chat}
      </Link>
      {data.locked && (
        <Link href="/dashboard/au-pair/abonnement" className={`${SECONDARY_BUTTON} flex-1 md:flex-none`}>
          <Lock {...ICON} size={16} />
          {t.subscriptionLock.subscribe}
        </Link>
      )}
    </>
  );

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className={`space-y-4 ${data ? "pb-24 md:pb-0" : ""}`}>
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors"
        >
          <ArrowLeft {...ICON} size={16} /> {td.back}
        </button>

        {loading ? (
          <LoadingState />
        ) : error || !data ? (
          <Panel className="p-10 text-center">
            <p className="text-sm text-gray-500 mb-4">{t.common.loadProfileError}</p>
            <Link href={SEARCH_HREF} className={SECONDARY_BUTTON}>{t.nav.searchFamily}</Link>
          </Panel>
        ) : (
          <>
            {/* En-tête : photo, nom, chiffres clés */}
            <Panel className="p-4 sm:p-5" tint={BLUE}>
              <div className="flex flex-col sm:flex-row gap-5">
                <FamilyPhoto data={data} onOpen={() => setPhotoOpen(true)} />
                <div className="flex-1 min-w-0 flex flex-col">
                  <h1 className="text-2xl sm:text-[28px] font-medium text-[#1A1A2E] tracking-tight truncate">{data.name}</h1>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    {flag ? (
                      <CountryFlag flag={flag} className="h-3.5 w-auto rounded-[2px] shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    )}
                    <span className="truncate">{data.city}, {tValue(data.country)}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Fact icon={Users} label={td.numberOfKids} value={data.numberOfKids} color={BLUE} />
                    <Fact icon={Clock} label={td.hoursPerWeek} value={data.hoursPerWeek != null ? `${data.hoursPerWeek} h` : "—"} color={TEAL} />
                    <Fact icon={Wallet} label={td.pocketMoney} value={data.pocketMoney != null ? `${data.pocketMoney} €` : "—"} color={ORANGE} />
                  </div>

                  {data.kidsAges.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">{td.kidsAges}</span>
                      <Chips items={data.kidsAges.map((age) => t.common.ages(String(age)))} color={BLUE} />
                    </div>
                  )}

                  <div className="hidden md:flex gap-2 mt-auto pt-4">{actions}</div>
                </div>
              </div>
            </Panel>

            {data.locked ? (
              <Panel className="p-5" tint={ORANGE}>
                <PanelHeader icon={Lock} color={ORANGE} title={td.lockedTitle} subtitle={td.lockedMessage} />
                <ul className="grid sm:grid-cols-2 gap-2 mb-5">
                  {td.lockedPerks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5 rounded-xl bg-white/70 border border-gray-100 px-4 py-3 text-sm text-[#1A1A2E]">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-[#3FA45B]/15 text-[#3FA45B] flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={2} />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/au-pair/abonnement" className={`${PRIMARY_BUTTON} w-full sm:w-auto`}>
                  {t.subscriptionLock.subscribeNow}
                </Link>
              </Panel>
            ) : (
              <div className="grid lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2 space-y-4">
                  {data.description && (
                    <Panel className="p-5">
                      <PanelHeader icon={FileText} color={BLUE} title={td.presentation} />
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.description}</p>
                    </Panel>
                  )}

                  <Panel className="p-5">
                    <PanelHeader icon={Baby} color={TEAL} title={td.kidsDaily} />
                    <div className="grid grid-cols-2 gap-2">
                      <Detail label={td.numberOfKids}>{t.common.kids(data.numberOfKids)}</Detail>
                      <Detail label={td.hoursPerWeek}>{data.hoursPerWeek != null ? t.common.hoursPerWeek(data.hoursPerWeek) : null}</Detail>
                    </div>
                    {data.auPairTasks && (
                      <Detail label={td.tasks} className="mt-2">
                        <span className="whitespace-pre-wrap leading-relaxed">{data.auPairTasks}</span>
                      </Detail>
                    )}
                  </Panel>

                  <Panel className="p-5">
                    <PanelHeader icon={Home} color={ORANGE} title={td.conditions} />
                    <div className="grid sm:grid-cols-3 gap-2">
                      <Detail label={td.accommodation}>{data.accommodation}</Detail>
                      <Detail label={td.mealsProvided}><YesNo value={!!data.mealsProvided} /></Detail>
                      <Detail label={td.pocketMoney}>{data.pocketMoney != null ? t.common.pocketMoney(data.pocketMoney) : null}</Detail>
                    </div>
                  </Panel>
                </div>

                <div className="space-y-4">
                  <Panel className="p-5">
                    <PanelHeader icon={Users} color={INDIGO} title={td.family} />
                    <div className="space-y-2">
                      <Detail label={td.maritalStatus}>
                        {data.maritalStatus ? (t.maritalStatus[data.maritalStatus as keyof typeof t.maritalStatus] ?? data.maritalStatus) : null}
                      </Detail>
                      <Detail label={td.parentsAges}>
                        {data.parentsAges && data.parentsAges.length > 0 ? t.common.ages(data.parentsAges.join(", ")) : null}
                      </Detail>
                      <Detail label={td.address}>{data.address}</Detail>
                    </div>
                  </Panel>

                  <Panel className="p-5">
                    <PanelHeader icon={Sparkles} color={TEAL} title={td.preferences} />
                    <div className="space-y-2">
                      <Detail label={td.preferredGender}>{data.preferredGender ? tValue(data.preferredGender) : td.noPreference}</Detail>
                      <Detail label={td.preferredAgeRange}>
                        {data.preferredAgeMin != null || data.preferredAgeMax != null
                          ? td.ageRange(String(data.preferredAgeMin ?? "—"), String(data.preferredAgeMax ?? "—"))
                          : td.noPreference}
                      </Detail>
                      <Detail label={td.preferredLanguages}>
                        {data.preferredLanguages && data.preferredLanguages.length > 0 ? (
                          <div className="mt-1">
                            <Chips items={data.preferredLanguages.map((l) => tValue(l))} color={TEAL} />
                          </div>
                        ) : (
                          td.noPreference
                        )}
                      </Detail>
                    </div>
                  </Panel>

                  {data.phoneWhatsapp && (
                    <Panel className="p-5" tint={GREEN}>
                      <PanelHeader icon={Phone} color={GREEN} title={td.contact} />
                      <Detail label="WhatsApp">
                        <span className="tabular-nums">{formatPhoneNumber(data.phoneWhatsapp)}</span>
                      </Detail>
                      <a
                        href={`https://wa.me/${data.phoneWhatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm text-white bg-[#3FA45B] hover:brightness-105 transition"
                      >
                        <Phone {...ICON} size={16} />
                        {td.writeOnWhatsapp}
                      </a>
                    </Panel>
                  )}
                </div>
              </div>
            )}

            {/* Actions toujours accessibles au pouce sur mobile */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-gray-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
              {actions}
            </div>
          </>
        )}
      </div>

      {photoOpen && data?.familyPhotoUrl && (
        <PhotoViewerModal url={data.familyPhotoUrl} alt={data.name} onClose={() => setPhotoOpen(false)} />
      )}
    </DashboardLayout>
  );
}
