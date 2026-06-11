"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle, X, Loader2, Phone, Languages, Star, CalendarRange,
  Home, User, Search, MessageCircle, Bell, Settings, Heart,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/favoris", icon: Heart, label: "Mes favoris" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

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
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Oui</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><X className="w-4 h-4" /> Non</span>
  );
}

export default function AuPairProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [data, setData] = useState<AuPairProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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
    <DashboardLayout navItems={navItems} role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-6 pb-24">
        <Link href="/trouver-au-pair" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour à la recherche
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500">Impossible de charger ce profil.</p>
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
                    {data.available ? <Badge variant="success">Disponible</Badge> : <Badge variant="warning">Indisponible</Badge>}
                  </div>
                </div>
                <div className="p-5">
                  <h1 className="font-bold text-[#1A1A2E] text-xl">{data.firstName} {data.lastName}</h1>
                  <p className="text-gray-500 text-sm mb-4">{data.age} ans · {data.cityOfOrigin ? `${data.cityOfOrigin}, ` : ""}{data.countryOfOrigin}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                      <span>{data.languages.join(", ") || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                      <span>{data.childcareYears != null ? `${data.childcareYears} ${data.childcareYears >= 5 ? "ans ou plus" : "an(s)"} d'expérience` : "Expérience non renseignée"}</span>
                    </div>
                    {(data.availableFrom || data.availableTo) && (
                      <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-[#E87722] flex-shrink-0" />
                        <span>
                          {data.availableFrom ? formatDate(data.availableFrom) : "—"} → {data.availableTo ? formatDate(data.availableTo) : "—"}
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
                <h2 className="font-bold text-[#1A1A2E] mb-3">Informations générales</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Genre" value={data.gender} />
                  <Field label="Nationalité" value={data.nationality} />
                  <Field label="Langues" value={data.languages.join(", ")} />
                  <Field label="Niveau d'études" value={data.educationLevel} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">Expérience & qualifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Années d'expérience" value={data.childcareYears != null ? `${data.childcareYears} ${data.childcareYears >= 5 ? "ans ou plus" : "an(s)"}` : null} />
                  <Field label="Premiers secours" value={<YesNo value={data.firstAidCertified} />} />
                  <Field label="Permis de conduire" value={<YesNo value={data.drivingLicense} />} />
                  <Field label="Fumeur" value={<YesNo value={data.isSmoker} />} />
                </div>
                {data.childcareExperience && (
                  <div className="mt-3">
                    <Field label="Expérience en garde d'enfants" value={<span className="whitespace-pre-wrap">{data.childcareExperience}</span>} />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">Disponibilité & destination</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pays ciblés" value={data.targetCountries.join(", ")} />
                  <Field label="Durée souhaitée" value={data.preferredDuration} />
                  <Field label="Disponible du" value={data.availableFrom ? formatDate(data.availableFrom) : null} />
                  <Field label="Disponible jusqu'au" value={data.availableTo ? formatDate(data.availableTo) : null} />
                </div>
              </div>

              {(data.description || data.motivation) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">Présentation</h2>
                  {data.description && <Field label="Description" value={<span className="whitespace-pre-wrap">{data.description}</span>} />}
                  {data.motivation && <div className="mt-3"><Field label="Motivation" value={<span className="whitespace-pre-wrap">{data.motivation}</span>} /></div>}
                </div>
              )}

              {(data.phoneWhatsapp1 || data.phoneWhatsapp2) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">Contact</h2>
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
                {data.isFavorite ? "Retirer des favoris" : "Mettre en favoris"}
              </Button>
              <Link href={`/dashboard/famille/messages?userId=${id}`} className="sm:w-64">
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Discuter
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
