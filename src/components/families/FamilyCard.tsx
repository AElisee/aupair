"use client";

import Link from "next/link";
import { ArrowRight, Baby, Clock, Home, Lock, MapPin, Wallet } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Famille telle que renvoyée par `/api/families` */
export type Family = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  kids: number;
  kidsAges: number[];
  tasks: string;
  hoursPerWeek: number;
  pocketMoney: number;
  languages: string[];
  description: string;
  familyPhotoUrl: string;
};

/** guest : visiteur non connecté · auPair : accès aux profils · other : famille/admin connecté */
export type FamilyViewer = "guest" | "auPair" | "other";

function Stat({ icon: Icon, label, value }: { icon: typeof Baby; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FFF3E0]/60 px-2 py-2.5 text-center">
      <Icon className="w-4 h-4 text-[#E87722] mx-auto mb-1" strokeWidth={1.75} />
      <p className="text-sm font-semibold text-[#1A1A2E] leading-tight">{value}</p>
      <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{label}</p>
    </div>
  );
}

export function FamilyCard({ fam, viewer }: { fam: Family; viewer: FamilyViewer }) {
  const { t, tValue } = useI18n();
  const f = t.findFamily;
  const extraLanguages = fam.languages.length - 3;

  const body = (
    <article className="h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
      <div className="relative aspect-4/3 bg-linear-to-br from-[#1A1A2E] to-[#0f3460] overflow-hidden">
        {fam.familyPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fam.familyPhotoUrl}
            alt={fam.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
            <Home className="w-10 h-10 mb-2" strokeWidth={1.25} />
            <p className="text-xs">{t.directory.noPhoto}</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/55 to-transparent" />
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5 text-white text-sm font-medium drop-shadow">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{fam.city}</span>
        </div>
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-[#1A1A2E] shadow-sm">
          <CountryFlag flag={fam.flag} className="h-3.5 w-auto rounded-[2px]" />
          {tValue(fam.country)}
        </span>
      </div>

      <div className="flex-1 flex flex-col p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-[#1A1A2E] truncate">{fam.name}</h3>
        {fam.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{fam.description}</p>}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat icon={Baby} label={f.statKids} value={String(fam.kids)} />
          <Stat icon={Clock} label={f.statHours} value={fam.hoursPerWeek ? f.hoursValue(fam.hoursPerWeek) : "—"} />
          <Stat icon={Wallet} label={f.statPocketMoney} value={fam.pocketMoney ? f.euroValue(fam.pocketMoney) : "—"} />
        </div>

        {fam.kidsAges.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {t.common.kids(fam.kids)}
            {t.common.kidsAges(fam.kidsAges.join(", "))}
          </p>
        )}

        {fam.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {fam.languages.slice(0, 3).map((l) => (
              <span key={l} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                {tValue(l)}
              </span>
            ))}
            {extraLanguages > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">+{extraLanguages}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div
            className={cn(
              "flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-medium transition-colors",
              viewer === "auPair"
                ? "bg-[#E87722] text-white group-hover:bg-[#d06619]"
                : viewer === "guest"
                  ? "bg-[#FFF3E0] text-[#E87722] group-hover:bg-[#E87722] group-hover:text-white"
                  : "bg-gray-100 text-gray-500"
            )}
          >
            {viewer === "auPair" ? (
              <>
                {t.directory.viewProfile} <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> {viewer === "guest" ? f.lockedProfile : f.reservedAuPairs}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  if (viewer === "other") return <div className="group h-full">{body}</div>;
  const href = viewer === "auPair" ? `/dashboard/au-pair/famille/${fam.id}` : "/inscription?role=au-pair";
  return (
    <Link href={href} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]">
      {body}
    </Link>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-4/3 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}
        </div>
        <div className="h-11 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
