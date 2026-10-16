"use client";

import Link from "next/link";
import { ArrowRight, Car, Languages, Lock, Star } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Au pair tel que renvoyé par `/api/au-pairs` */
export type AuPair = {
  id: string;
  firstName: string;
  profilePhotoUrl: string;
  age: number;
  gender: string;
  country: string;
  flag: string;
  languages: string[];
  experience: number;
  drivingLicense: boolean;
  targetCountries: string[];
  description: string;
  available: boolean;
  isFavorite: boolean;
};

/** guest : visiteur non connecté · family : accès aux profils · other : au pair/admin connecté */
export type AuPairViewer = "guest" | "family" | "other";

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FFF3E0]/60 px-2 py-2.5 text-center">
      <Icon className="w-4 h-4 text-[#E87722] mx-auto mb-1" strokeWidth={1.75} />
      <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">{value}</p>
      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{label}</p>
    </div>
  );
}

export function AuPairCard({ ap, viewer }: { ap: AuPair; viewer: AuPairViewer }) {
  const { t, tValue } = useI18n();
  const f = t.findAuPair;
  const extraTargets = ap.targetCountries.length - 3;

  const body = (
    <article className="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
      <div className="relative aspect-4/3 bg-linear-to-br from-[#FFF3E0] to-[#FFE0B2] overflow-hidden">
        {ap.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ap.profilePhotoUrl}
            alt={ap.firstName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#E87722] flex items-center justify-center text-white text-3xl font-semibold">
              {ap.firstName.charAt(0)}
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/55 to-transparent" />
        <p className="absolute left-3 right-3 bottom-3 text-white text-lg font-semibold drop-shadow truncate">
          {ap.firstName}, {t.common.age(ap.age)}
        </p>
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[#1A1A2E] shadow-sm">
          <CountryFlag flag={ap.flag} className="h-3.5 w-auto rounded-[2px]" />
          {tValue(ap.country)}
        </span>
        <span
          className={cn(
            "absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm",
            ap.available ? "bg-[#3FA45B] text-white" : "bg-white/95 text-gray-500"
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", ap.available ? "bg-white" : "bg-gray-400")} />
          {ap.available ? t.common.available : t.common.unavailable}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-5">
        {ap.description && <p className="text-sm text-gray-500 line-clamp-2">{ap.description}</p>}

        <div className={cn("grid grid-cols-3 gap-2", ap.description && "mt-4")}>
          <Stat icon={Star} label={f.statExperience} value={f.yearsValue(ap.experience)} />
          <Stat icon={Languages} label={f.statLanguages} value={String(ap.languages.length)} />
          <Stat icon={Car} label={f.statLicense} value={ap.drivingLicense ? t.common.yes : t.common.no} />
        </div>

        {ap.targetCountries.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1.5">{f.wishes}</p>
            <div className="flex flex-wrap gap-1.5">
              {ap.targetCountries.slice(0, 3).map((c) => (
                <span key={c} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                  {tValue(c)}
                </span>
              ))}
              {extraTargets > 0 && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">+{extraTargets}</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <div
            className={cn(
              "flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-colors",
              viewer === "family"
                ? "bg-[#E87722] text-white group-hover:bg-[#d06619]"
                : viewer === "guest"
                  ? "bg-[#FFF3E0] text-[#E87722] group-hover:bg-[#E87722] group-hover:text-white"
                  : "bg-gray-100 text-gray-500"
            )}
          >
            {viewer === "family" ? (
              <>
                {t.directory.viewProfile} <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> {viewer === "guest" ? f.lockedProfile : f.reservedFamilies}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  if (viewer === "other") return <div className="group h-full">{body}</div>;
  const href = viewer === "family" ? `/dashboard/famille/au-pair/${ap.id}` : "/inscription?role=famille";
  return (
    <Link href={href} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]">
      {body}
    </Link>
  );
}

export function AuPairCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-4/3 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}
        </div>
        <div className="h-11 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
