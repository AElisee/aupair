"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Heart, Languages, Star, MapPin, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

type AuPair = {
  id: string;
  firstName: string;
  profilePhotoUrl: string;
  age: number;
  country: string;
  flag: string;
  languages: string[];
  experience: number;
  targetCountries: string[];
  description: string;
  available: boolean;
};

export default function FavorisPage() {
  const { data: session } = useSession();
  const [auPairs, setAuPairs] = useState<AuPair[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, tValue, tList } = useI18n();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : { auPairs: [] }))
      .then((data) => {
        if (!cancelled) setAuPairs(data.auPairs ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardLayout role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{t.favorites.title}</h1>
          <p className="text-gray-500">{t.favorites.subtitle}</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </div>
        ) : auPairs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">{t.favorites.empty}</p>
            <Link href="/trouver-au-pair" className="text-[#E87722] font-semibold text-sm">
              {t.favorites.discover}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auPairs.map((ap) => (
              <Link key={ap.id} href={`/dashboard/famille/au-pair/${ap.id}`} className="block">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center overflow-hidden">
                    {ap.profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ap.profilePhotoUrl} alt={ap.firstName} className="absolute inset-0 w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {ap.firstName.charAt(0)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {ap.available ? <Badge variant="success">{t.common.available}</Badge> : <Badge variant="warning">{t.common.unavailable}</Badge>}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-[#1A1A2E] text-lg">{ap.firstName}, {t.common.age(ap.age)}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <span>{ap.flag}</span>
                      <span>{tValue(ap.country)}</span>
                    </div>

                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{ap.description}</p>

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5 text-[#E87722]" />
                        <span>{tList(ap.languages)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-[#E87722]" />
                        <span>{t.common.experience(ap.experience)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#E87722]" />
                        <span>{t.common.wishes(tList(ap.targetCountries))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
