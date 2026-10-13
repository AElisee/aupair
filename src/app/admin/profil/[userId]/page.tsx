"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import { ArrowLeft, CheckCircle, X, Loader2, Maximize2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/i18n";

type AuPairDetail = {
  role: "AU_PAIR";
  email: string;
  memberSince: string;
  status: string;
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
};

type FamilyDetail = {
  role: "FAMILLE";
  name: string | null;
  email: string;
  memberSince: string;
  status: string;
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

type ProfileStatus = "PENDING" | "ACTIVE" | "HIDDEN" | "SUSPENDED" | "DELETED";

const STATUS_VARIANTS: Record<ProfileStatus, "warning" | "success" | "secondary" | "destructive"> = {
  PENDING: "warning",
  ACTIVE: "success",
  HIDDEN: "secondary",
  SUSPENDED: "destructive",
  DELETED: "destructive",
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
    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> {t.adminCommon.yes}</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><X className="w-4 h-4" /> {t.adminCommon.no}</span>
  );
}

export default function AdminProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") === "FAMILLE" ? "FAMILLE" : "AU_PAIR";

  const [data, setData] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const { t, locale, tValue, tList } = useI18n();
  const c = t.adminCommon;
  const tp = t.adminProfile;
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale);
  const flagMap = Object.fromEntries([...originCountries, ...hostCountries].map((c) => [c.name, c.flag]));

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/profile/${userId}?role=${role}`)
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
  }, [userId, role]);

  const status = data
    ? data.status in STATUS_VARIANTS
      ? { variant: STATUS_VARIANTS[data.status as ProfileStatus], label: c.profileStatus[data.status as ProfileStatus] }
      : { variant: "secondary" as const, label: data.status }
    : null;
  const photoUrl = data ? (data.role === "AU_PAIR" ? data.profilePhotoUrl : data.familyPhotoUrl) : null;

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
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{c.loading}</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">{tp.loadError}</p>
          </div>
        ) : (
          <>
            {/* En-tête */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
                    ) : (
                      (data.role === "AU_PAIR" ? data.firstName : data.name ?? "F").charAt(0)
                    )}
                  </div>
                  {photoUrl && (
                    <button
                      onClick={() => setShowPhoto(true)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1A1A2E] rounded-full flex items-center justify-center"
                      title={c.viewPhoto}
                    >
                      <Maximize2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-[#1A1A2E] text-lg">
                      {data.role === "AU_PAIR" ? `${data.firstName} ${data.lastName}` : data.name ?? tp.familyFallback}
                    </h1>
                    <span className="text-lg">{flagMap[data.role === "AU_PAIR" ? data.countryOfOrigin : data.country] ?? ""}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={data.role === "AU_PAIR" ? "default" : "secondary"}>
                      {data.role === "AU_PAIR" ? c.roleAuPair : c.roleFamily}
                    </Badge>
                    {status && <Badge variant={status.variant}>{status.label}</Badge>}
                    {data.role === "AU_PAIR" && (
                      <Badge variant={data.isAvailable ? "success" : "warning"}>
                        {data.isAvailable ? tp.available : tp.unavailable}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {photoUrl && (
                <Button size="sm" variant="outline" onClick={() => setShowPhoto(true)}>
                  {c.viewPhoto}
                </Button>
              )}
            </div>

            {data.role === "AU_PAIR" ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.general}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.age} value={tp.ageValue(data.age)} />
                    <Field label={tp.dateOfBirth} value={formatDate(data.dateOfBirth)} />
                    <Field label={tp.gender} value={tValue(data.gender)} />
                    <Field label={tp.nationality} value={data.nationality} />
                    <Field label={tp.countryOfOrigin} value={tValue(data.countryOfOrigin)} />
                    <Field label={tp.cityOfOrigin} value={data.cityOfOrigin} />
                    <Field label={tp.languages} value={tList(data.languages)} />
                    <Field label={tp.educationLevel} value={tValue(data.educationLevel)} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.experience}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.yearsOfExperience} value={data.childcareYears != null ? tp.experienceYears(data.childcareYears) : null} />
                    <Field label={tp.firstAid} value={<YesNo value={data.firstAidCertified} />} />
                    <Field label={tp.drivingLicense} value={<YesNo value={data.drivingLicense} />} />
                  </div>
                  {data.childcareExperience && (
                    <div className="mt-3">
                      <Field label={tp.childcareExperience} value={<span className="whitespace-pre-wrap">{data.childcareExperience}</span>} />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.availability}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.targetCountries} value={data.targetCountries.map((country) => `${flagMap[country] ?? ""} ${tValue(country)}`).join(", ")} />
                    <Field label={tp.preferredDuration} value={tValue(data.preferredDuration)} />
                    <Field label={tp.availableFrom} value={data.availableFrom ? formatDate(data.availableFrom) : null} />
                    <Field label={tp.availableTo} value={data.availableTo ? formatDate(data.availableTo) : null} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.health}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.smoker} value={<YesNo value={data.isSmoker} />} />
                    <Field label={tp.criminalRecord} value={<YesNo value={data.hasCriminalRecord} />} />
                  </div>
                  {data.healthDeclaration && (
                    <div className="mt-3">
                      <Field label={tp.healthDeclaration} value={<span className="whitespace-pre-wrap">{data.healthDeclaration}</span>} />
                    </div>
                  )}
                </div>

                {(data.description || data.motivation) && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.presentation}</h3>
                    {data.description && <Field label={tp.description} value={<span className="whitespace-pre-wrap">{data.description}</span>} />}
                    {data.motivation && <div className="mt-3"><Field label={tp.motivation} value={<span className="whitespace-pre-wrap">{data.motivation}</span>} /></div>}
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.contact}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.email} value={data.email} />
                    <Field label="WhatsApp" value={data.phoneWhatsapp1} />
                    {data.phoneWhatsapp2 && <Field label="WhatsApp (2)" value={data.phoneWhatsapp2} />}
                    <Field label={tp.memberSince} value={formatDate(data.memberSince)} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.documents}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label={tp.profilePhoto}
                      value={data.profilePhotoUrl ? <a href={data.profilePhotoUrl} target="_blank" rel="noreferrer" className="text-[#E87722] underline">{c.viewPhoto}</a> : null}
                    />
                    <Field
                      label={tp.idDocument}
                      value={
                        data.idDocumentUrls.length > 0 ? (
                          <span className="flex flex-col gap-1">
                            {data.idDocumentUrls.map((url, i) => (
                              <a key={url} href={url} target="_blank" rel="noreferrer" className="text-[#E87722] underline">
                                {tp.viewDocument(data.idDocumentUrls.length > 1 ? String(i + 1) : "")}
                              </a>
                            ))}
                          </span>
                        ) : null
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.general}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.country} value={tValue(data.country)} />
                    <Field label={tp.city} value={data.city} />
                    <Field label={tp.address} value={data.address} />
                    <Field label={tp.maritalStatus} value={t.maritalStatus[data.maritalStatus as keyof typeof t.maritalStatus] ?? data.maritalStatus} />
                    <Field label={tp.parentsAges} value={data.parentsAges.join(", ")} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.children}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.numberOfKids} value={data.numberOfKids} />
                    <Field label={tp.kidsAges} value={data.kidsAges.join(", ")} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.conditions}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.hoursPerWeek} value={data.hoursPerWeek != null ? `${data.hoursPerWeek}h` : null} />
                    <Field label={tp.pocketMoney} value={data.pocketMoney != null ? `${data.pocketMoney} €` : null} />
                    <Field label={tp.accommodation} value={data.accommodation} />
                    <Field label={tp.mealsProvided} value={<YesNo value={data.mealsProvided} />} />
                  </div>
                  {data.auPairTasks && (
                    <div className="mt-3">
                      <Field label={tp.tasks} value={<span className="whitespace-pre-wrap">{data.auPairTasks}</span>} />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.wantedAuPair}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.preferredGender} value={data.preferredGender ? tValue(data.preferredGender) : null} />
                    <Field
                      label={tp.ageRange}
                      value={data.preferredAgeMin != null && data.preferredAgeMax != null ? tp.ageRangeValue(data.preferredAgeMin, data.preferredAgeMax) : null}
                    />
                    <Field label={tp.preferredLanguages} value={tList(data.preferredLanguages)} />
                  </div>
                </div>

                {data.description && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.presentation}</h3>
                    <Field label={tp.description} value={<span className="whitespace-pre-wrap">{data.description}</span>} />
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.contact}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label={tp.email} value={data.email} />
                    <Field label="WhatsApp" value={data.phoneWhatsapp} />
                    <Field label={tp.memberSince} value={formatDate(data.memberSince)} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-bold text-[#1A1A2E] mb-3">{tp.documents}</h3>
                  <Field
                    label={tp.familyPhoto}
                    value={data.familyPhotoUrl ? <a href={data.familyPhotoUrl} target="_blank" rel="noreferrer" className="text-[#E87722] underline">{c.viewPhoto}</a> : null}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showPhoto && photoUrl && (
        <PhotoViewerModal url={photoUrl} onClose={() => setShowPhoto(false)} />
      )}
    </AdminLayout>
  );
}
