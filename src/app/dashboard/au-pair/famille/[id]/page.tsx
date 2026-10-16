"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { SubscriptionLockCard } from "@/components/dashboard/SubscriptionLock";
import { ArrowLeft, Loader2, Phone, Languages, Users, Wallet, MessageCircle, CheckCircle, X } from "lucide-react";
import { useI18n } from "@/i18n";

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

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [data, setData] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, tValue, tList } = useI18n();
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

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-6 pb-24">
        <Link href="/dashboard/au-pair" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors">
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
                  {data.familyPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.familyPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-24 h-24 bg-[#E87722] rounded-full flex items-center justify-center text-white text-4xl font-medium">
                      {data.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h1 className="font-medium text-[#1A1A2E] text-xl">{data.name}</h1>
                  <p className="text-gray-500 text-sm mb-4">{data.city}, {tValue(data.country)}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#E87722] shrink-0" />
                      <span>
                        {t.common.kids(data.numberOfKids)}
                        {data.kidsAges.length > 0 ? t.common.kidsAges(data.kidsAges.join(", ")) : ""}
                      </span>
                    </div>
                    {data.hoursPerWeek != null && (
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-[#E87722] shrink-0" />
                        <span>{t.common.hoursPerWeek(data.hoursPerWeek)}</span>
                      </div>
                    )}
                    {data.pocketMoney != null && (
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#E87722] shrink-0" />
                        <span>{t.common.pocketMoney(data.pocketMoney)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : détails */}
            <div className="lg:col-span-2 space-y-6">
              {data.locked ? (
                <SubscriptionLockCard
                  title={td.lockedTitle}
                  message={td.lockedMessage}
                />
              ) : (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3">{td.general}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={td.country} value={tValue(data.country)} />
                      <Field label={td.city} value={data.city} />
                      <Field label={td.address} value={data.address ?? null} />
                      <Field label={td.maritalStatus} value={data.maritalStatus ? (t.maritalStatus[data.maritalStatus as keyof typeof t.maritalStatus] ?? data.maritalStatus) : null} />
                      <Field label={td.parentsAges} value={data.parentsAges && data.parentsAges.length > 0 ? t.common.ages(data.parentsAges.join(", ")) : null} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3">{td.kidsDaily}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={td.numberOfKids} value={data.numberOfKids} />
                      <Field label={td.kidsAges} value={data.kidsAges.length > 0 ? t.common.ages(data.kidsAges.join(", ")) : null} />
                      <Field label={td.hoursPerWeek} value={data.hoursPerWeek != null ? `${data.hoursPerWeek}h` : null} />
                      <Field label={td.pocketMoney} value={data.pocketMoney != null ? t.common.pocketMoney(data.pocketMoney) : null} />
                      <Field label={td.accommodation} value={data.accommodation ?? null} />
                      <Field label={td.mealsProvided} value={<YesNo value={!!data.mealsProvided} />} />
                    </div>
                    {data.auPairTasks && (
                      <div className="mt-3">
                        <Field label={td.tasks} value={<span className="whitespace-pre-wrap">{data.auPairTasks}</span>} />
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3">{td.preferences}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={td.preferredGender} value={data.preferredGender ? tValue(data.preferredGender) : null} />
                      <Field
                        label={td.preferredAgeRange}
                        value={
                          data.preferredAgeMin != null || data.preferredAgeMax != null
                            ? td.ageRange(String(data.preferredAgeMin ?? "—"), String(data.preferredAgeMax ?? "—"))
                            : null
                        }
                      />
                      <Field label={td.preferredLanguages} value={data.preferredLanguages ? tList(data.preferredLanguages) : null} />
                    </div>
                  </div>

                  {data.description && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3">{td.presentation}</h2>
                      <Field label={td.description} value={<span className="whitespace-pre-wrap">{data.description}</span>} />
                    </div>
                  )}

                  {data.phoneWhatsapp && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-3">{td.contact}</h2>
                      <Field label="WhatsApp" value={<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#E87722]" /> {data.phoneWhatsapp}</span>} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] p-4">
            <div className="flex justify-center max-w-3xl mx-auto">
              <Link href={`/dashboard/au-pair/messages?userId=${id}`} className="sm:w-64">
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
