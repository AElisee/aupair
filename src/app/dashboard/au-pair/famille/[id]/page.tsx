"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Phone, Languages, Users, Wallet,
  Home, User, Search, MessageCircle, Bell, CreditCard, Settings, CheckCircle, X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

const MARITAL_LABELS: Record<string, string> = {
  MARRIED: "Marié(e)",
  SINGLE: "Célibataire",
  DIVORCED: "Divorcé(e)",
  OTHER: "Autre",
};

type FamilyProfile = {
  name: string;
  familyPhotoUrl: string;
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
  phoneWhatsapp: string | null;
  preferredGender: string | null;
  preferredAgeMin: number | null;
  preferredAgeMax: number | null;
  preferredLanguages: string[];
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

export default function FamilyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [data, setData] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    <DashboardLayout navItems={navItems} role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-6 pb-24">
        <Link href="/dashboard/au-pair" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#E87722] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
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
                  {data.familyPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.familyPhotoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-24 h-24 bg-[#E87722] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {data.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h1 className="font-bold text-[#1A1A2E] text-xl">{data.name}</h1>
                  <p className="text-gray-500 text-sm mb-4">{data.city}, {data.country}</p>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#E87722] shrink-0" />
                      <span>
                        {data.numberOfKids} enfant{data.numberOfKids > 1 ? "s" : ""}
                        {data.kidsAges.length > 0 ? ` (${data.kidsAges.join(", ")} ans)` : ""}
                      </span>
                    </div>
                    {data.hoursPerWeek != null && (
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-[#E87722] shrink-0" />
                        <span>{data.hoursPerWeek}h/semaine</span>
                      </div>
                    )}
                    {data.pocketMoney != null && (
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#E87722] shrink-0" />
                        <span>{data.pocketMoney}€/mois</span>
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
                  <Field label="Pays" value={data.country} />
                  <Field label="Ville" value={data.city} />
                  <Field label="Adresse" value={data.address} />
                  <Field label="Situation familiale" value={MARITAL_LABELS[data.maritalStatus] ?? data.maritalStatus} />
                  <Field label="Âge des parents" value={data.parentsAges.length > 0 ? data.parentsAges.join(", ") + " ans" : null} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">Enfants & quotidien</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre d'enfants" value={data.numberOfKids} />
                  <Field label="Âge des enfants" value={data.kidsAges.length > 0 ? data.kidsAges.join(", ") + " ans" : null} />
                  <Field label="Heures par semaine" value={data.hoursPerWeek != null ? `${data.hoursPerWeek}h` : null} />
                  <Field label="Argent de poche" value={data.pocketMoney != null ? `${data.pocketMoney}€/mois` : null} />
                  <Field label="Logement proposé" value={data.accommodation} />
                  <Field label="Repas fournis" value={<YesNo value={data.mealsProvided} />} />
                </div>
                {data.auPairTasks && (
                  <div className="mt-3">
                    <Field label="Tâches confiées à l'au pair" value={<span className="whitespace-pre-wrap">{data.auPairTasks}</span>} />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-[#1A1A2E] mb-3">Préférences pour l'au pair</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Genre préféré" value={data.preferredGender} />
                  <Field
                    label="Tranche d'âge préférée"
                    value={
                      data.preferredAgeMin != null || data.preferredAgeMax != null
                        ? `${data.preferredAgeMin ?? "—"} - ${data.preferredAgeMax ?? "—"} ans`
                        : null
                    }
                  />
                  <Field label="Langues souhaitées" value={data.preferredLanguages.join(", ")} />
                </div>
              </div>

              {data.description && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">Présentation</h2>
                  <Field label="Description" value={<span className="whitespace-pre-wrap">{data.description}</span>} />
                </div>
              )}

              {data.phoneWhatsapp && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-[#1A1A2E] mb-3">Contact</h2>
                  <Field label="WhatsApp" value={<span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#E87722]" /> {data.phoneWhatsapp}</span>} />
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] p-4">
            <div className="flex justify-center max-w-3xl mx-auto">
              <Link href="/dashboard/au-pair/messages" className="sm:w-64">
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
