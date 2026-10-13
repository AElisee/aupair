"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, X, Loader2, Phone, Languages, Star, CalendarRange, MessageCircle, Heart } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/i18n";

type AuPairProfile = {
  available: boolean;
  isFavorite: boolean;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string;
  age: number;
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
  description: string | null;
  motivation: string | null;
  phoneWhatsapp1: string | null;
  phoneWhatsapp2: string | null;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-[#1A1A2E]">{value || "—"}</p>
    </div>
  );
}

function YesNo({ value }: { value: boolean }) {
  const { t } = useI18n();
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> {t.common.yes}</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><X className="w-4 h-4" /> {t.common.no}</span>
  );
}

export default function AuPairProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [data, setData] = useState<AuPairProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { t, locale, tValue, tList } = useI18n();
  const td = t.auPairDetail;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/au-pairs/${id}`)
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

  const toggleFavorite = async () => {
    if (!data || favoriteLoading) return;
    setFavoriteLoading(true);
    const nextFavorite = !data.isFavorite;
    try {
      const res = await fetch(`/api/favorites${nextFavorite ? "" : `?targetId=${id}`}`, {
        method: nextFavorite ? "POST" : "DELETE",
        headers: nextFavorite ? { "Content-Type": "application/json" } : undefined,
        body: nextFavorite ? JSON.stringify({ targetId: id }) : undefined,
      });
      if (res.ok) {
        setData({ ...data, isFavorite: nextFavorite });
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <DashboardLayout role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-6 pb-24">
        <Link href="/trouver-au-pair" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors">
          <ArrowLeft className="w-4 h-4" /> {td.back}
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">{t.common.loadProfileError}</p>
          </div>
        ) : (
          <>
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Colonne gauche : photo + infos clés */}
            <div className="lg:col-span-1 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center overflow-hidden">
                  {data.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.profilePhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-24 h-24 bg-[#E87722] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {data.firstName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {data.available ? <Badge variant="success">{t.common.available}</Badge> : <Badge variant="warning">{t.common.unavailable}</Badge>}
                  </div>
                </div>
                <div className="p-5">
                  <h1 className="font-bold text-[#1A1A2E] text-xl">{data.firstName} {data.lastName}</h1>
                  <p className="text-gray-500 text-sm mb-4">{t.common.age(data.age)} · {data.cityOfOrigin ? `${data.cityOfOrigin}, ` : ""}{tValue(data.countryOfOrigin)}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                      <span>{tList(data.languages) || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                      <span>{data.childcareYears != null ? td.experienceLine(data.childcareYears) : td.experienceUnknown}</span>
                    </div>
                    {(data.availableFrom || data.availableTo) && (
                      <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                        <span>
                          {data.availableFrom ? formatDate(data.availableFrom, locale) : "—"} → {data.availableTo ? formatDate(data.availableTo, locale) : "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : détails */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">{td.general}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={td.gender} value={tValue(data.gender)} />
                  <Field label={td.nationality} value={data.nationality} />
                  <Field label={td.languages} value={tList(data.languages)} />
                  <Field label={td.educationLevel} value={tValue(data.educationLevel)} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">{td.experienceQualifications}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={td.yearsOfExperience} value={data.childcareYears != null ? td.experienceYears(data.childcareYears) : null} />
                  <Field label={td.firstAid} value={<YesNo value={data.firstAidCertified} />} />
                  <Field label={td.drivingLicense} value={<YesNo value={data.drivingLicense} />} />
                  <Field label={td.smoker} value={<YesNo value={data.isSmoker} />} />
                </div>
                {data.childcareExperience && (
                  <div className="mt-3">
                    <Field label={td.childcareExperience} value={<span className="whitespace-pre-wrap">{data.childcareExperience}</span>} />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">{td.availability}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={td.targetCountries} value={tList(data.targetCountries)} />
                  <Field label={td.preferredDuration} value={tValue(data.preferredDuration)} />
                  <Field label={td.availableFrom} value={data.availableFrom ? formatDate(data.availableFrom, locale) : null} />
                  <Field label={td.availableTo} value={data.availableTo ? formatDate(data.availableTo, locale) : null} />
                </div>
              </div>

              {(data.description || data.motivation) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">{td.presentation}</h2>
                  {data.description && <Field label={td.description} value={<span className="whitespace-pre-wrap">{data.description}</span>} />}
                  {data.motivation && <div className="mt-3"><Field label={td.motivation} value={<span className="whitespace-pre-wrap">{data.motivation}</span>} /></div>}
                </div>
              )}

              {(data.phoneWhatsapp1 || data.phoneWhatsapp2) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">{td.contact}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.phoneWhatsapp1 && <Field label="WhatsApp" value={<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#E87722]" /> {data.phoneWhatsapp1}</span>} />}
                    {data.phoneWhatsapp2 && <Field label="WhatsApp (2)" value={<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#E87722]" /> {data.phoneWhatsapp2}</span>} />}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto">
              <Button
                variant={data.isFavorite ? "default" : "outline"}
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="sm:w-64"
              >
                <Heart className={`w-4 h-4 mr-2 ${data.isFavorite ? "fill-current" : ""}`} />
                {data.isFavorite ? t.common.removeFromFavorites : td.addToFavorites}
              </Button>
              <Link href={`/dashboard/famille/messages?userId=${id}`} className="sm:w-64">
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t.common.chat}
                </Button>
              </Link>
            </div>
          </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
