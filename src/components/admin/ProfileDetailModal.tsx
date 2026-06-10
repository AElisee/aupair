"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useCountries } from "@/hooks/useCountries";

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
  idDocumentUrl: string | null;
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

const STATUS_LABELS: Record<string, { variant: "warning" | "success" | "secondary" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "En attente" },
  ACTIVE: { variant: "success", label: "Actif" },
  HIDDEN: { variant: "secondary", label: "Masqué" },
  SUSPENDED: { variant: "destructive", label: "Suspendu" },
  DELETED: { variant: "destructive", label: "Supprimé" },
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
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Oui</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><X className="w-4 h-4" /> Non</span>
  );
}

export default function ProfileDetailModal({
  userId,
  role,
  onClose,
}: {
  userId: string;
  role: "AU_PAIR" | "FAMILLE";
  onClose: () => void;
}) {
  const [data, setData] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { origin: originCountries, host: hostCountries } = useCountries();
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

  const status = data ? STATUS_LABELS[data.status] ?? { variant: "secondary" as const, label: data.status } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : error || !data ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Impossible de charger ce profil.</p>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E87722] rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
                  {(() => {
                    const photoUrl = data.role === "AU_PAIR" ? data.profilePhotoUrl : data.familyPhotoUrl;
                    return photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="" className="w-full h-full object-cover object-top" />
                    ) : (
                      (data.role === "AU_PAIR" ? data.firstName : data.name ?? "F").charAt(0)
                    );
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-[#1A1A2E] text-lg">
                      {data.role === "AU_PAIR" ? `${data.firstName} ${data.lastName}` : data.name ?? "Famille"}
                    </h2>
                    <span className="text-lg">{flagMap[data.role === "AU_PAIR" ? data.countryOfOrigin : data.country] ?? ""}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={data.role === "AU_PAIR" ? "default" : "secondary"}>
                      {data.role === "AU_PAIR" ? "Au pair" : "Famille"}
                    </Badge>
                    {status && <Badge variant={status.variant}>{status.label}</Badge>}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {data.role === "AU_PAIR" ? (
                <>
                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Informations générales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Âge" value={`${data.age} ans`} />
                      <Field label="Date de naissance" value={formatDate(data.dateOfBirth)} />
                      <Field label="Genre" value={data.gender} />
                      <Field label="Nationalité" value={data.nationality} />
                      <Field label="Pays d'origine" value={data.countryOfOrigin} />
                      <Field label="Ville d'origine" value={data.cityOfOrigin} />
                      <Field label="Langues" value={data.languages.join(", ")} />
                      <Field label="Niveau d'études" value={data.educationLevel} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Expérience & qualifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Années d'expérience" value={data.childcareYears != null ? `${data.childcareYears} ${data.childcareYears >= 5 ? "ans ou plus" : "an(s)"}` : null} />
                      <Field label="Premiers secours" value={<YesNo value={data.firstAidCertified} />} />
                      <Field label="Permis de conduire" value={<YesNo value={data.drivingLicense} />} />
                    </div>
                    {data.childcareExperience && (
                      <div className="mt-3">
                        <Field label="Expérience en garde d'enfants" value={<span className="whitespace-pre-wrap">{data.childcareExperience}</span>} />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Disponibilité & destination</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Pays ciblés" value={data.targetCountries.map((c) => `${flagMap[c] ?? ""} ${c}`).join(", ")} />
                      <Field label="Durée souhaitée" value={data.preferredDuration} />
                      <Field label="Disponible du" value={data.availableFrom ? formatDate(data.availableFrom) : null} />
                      <Field label="Disponible jusqu'au" value={data.availableTo ? formatDate(data.availableTo) : null} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Santé & déclarations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Fumeur" value={<YesNo value={data.isSmoker} />} />
                      <Field label="Casier judiciaire" value={<YesNo value={data.hasCriminalRecord} />} />
                    </div>
                    {data.healthDeclaration && (
                      <div className="mt-3">
                        <Field label="Déclaration de santé" value={<span className="whitespace-pre-wrap">{data.healthDeclaration}</span>} />
                      </div>
                    )}
                  </div>

                  {(data.description || data.motivation) && (
                    <div>
                      <h3 className="font-bold text-[#1A1A2E] mb-3">Présentation</h3>
                      {data.description && <Field label="Description" value={<span className="whitespace-pre-wrap">{data.description}</span>} />}
                      {data.motivation && <div className="mt-3"><Field label="Motivation" value={<span className="whitespace-pre-wrap">{data.motivation}</span>} /></div>}
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email" value={data.email} />
                      <Field label="WhatsApp" value={data.phoneWhatsapp1} />
                      {data.phoneWhatsapp2 && <Field label="WhatsApp (2)" value={data.phoneWhatsapp2} />}
                      <Field label="Membre depuis" value={formatDate(data.memberSince)} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        label="Photo de profil"
                        value={data.profilePhotoUrl ? <a href={data.profilePhotoUrl} target="_blank" rel="noreferrer" className="text-[#E87722] underline">Voir la photo</a> : null}
                      />
                      <Field
                        label="Pièce d'identité"
                        value={data.idDocumentUrl ? <a href={data.idDocumentUrl} target="_blank" rel="noreferrer" className="text-[#E87722] underline">Voir le document</a> : null}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Informations générales</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Pays" value={data.country} />
                      <Field label="Ville" value={data.city} />
                      <Field label="Adresse" value={data.address} />
                      <Field label="Situation familiale" value={data.maritalStatus} />
                      <Field label="Âge des parents" value={data.parentsAges.join(", ")} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Enfants</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nombre d'enfants" value={data.numberOfKids} />
                      <Field label="Âges des enfants" value={data.kidsAges.join(", ")} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Conditions proposées</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Heures / semaine" value={data.hoursPerWeek != null ? `${data.hoursPerWeek}h` : null} />
                      <Field label="Argent de poche" value={data.pocketMoney != null ? `${data.pocketMoney} €` : null} />
                      <Field label="Hébergement" value={data.accommodation} />
                      <Field label="Repas fournis" value={<YesNo value={data.mealsProvided} />} />
                    </div>
                    {data.auPairTasks && (
                      <div className="mt-3">
                        <Field label="Tâches confiées à l'au pair" value={<span className="whitespace-pre-wrap">{data.auPairTasks}</span>} />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Au pair recherchée</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Genre préféré" value={data.preferredGender} />
                      <Field
                        label="Tranche d'âge"
                        value={data.preferredAgeMin != null && data.preferredAgeMax != null ? `${data.preferredAgeMin} - ${data.preferredAgeMax} ans` : null}
                      />
                      <Field label="Langues souhaitées" value={data.preferredLanguages.join(", ")} />
                    </div>
                  </div>

                  {data.description && (
                    <div>
                      <h3 className="font-bold text-[#1A1A2E] mb-3">Présentation</h3>
                      <Field label="Description" value={<span className="whitespace-pre-wrap">{data.description}</span>} />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email" value={data.email} />
                      <Field label="WhatsApp" value={data.phoneWhatsapp} />
                      <Field label="Membre depuis" value={formatDate(data.memberSince)} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-3">Documents</h3>
                    <Field
                      label="Photo de famille"
                      value={data.familyPhotoUrl ? <a href={data.familyPhotoUrl} target="_blank" rel="noreferrer" className="text-[#E87722] underline">Voir la photo</a> : null}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
