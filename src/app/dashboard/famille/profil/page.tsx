"use client";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, Settings, Home, Camera, CheckCircle, Loader2, Heart } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { useCountries } from "@/hooks/useCountries";

const navItems = [
  { href: "/dashboard/famille", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/famille/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/famille/recherche", icon: Search, label: "Rechercher un au pair" },
  { href: "/dashboard/famille/favoris", icon: Heart, label: "Mes favoris" },
  { href: "/dashboard/famille/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/famille/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/famille/parametres", icon: Settings, label: "Paramètres" },
];

const STATUS_BADGES: Record<string, { variant: "warning" | "success" | "secondary" | "destructive"; label: string }> = {
  PENDING: { variant: "warning", label: "En attente de validation" },
  ACTIVE: { variant: "success", label: "Profil validé" },
  HIDDEN: { variant: "secondary", label: "Profil masqué" },
  SUSPENDED: { variant: "destructive", label: "Profil suspendu" },
  DELETED: { variant: "destructive", label: "Profil supprimé" },
};

const MARITAL_STATUSES = [
  { value: "MARRIED", label: "Marié(e)" },
  { value: "SINGLE", label: "Célibataire" },
  { value: "DIVORCED", label: "Divorcé(e)" },
  { value: "OTHER", label: "Autre" },
];

type Profile = {
  status: string;
  familyPhotoUrl: string;
  firstName: string; lastName: string;
  country: string; city: string; address: string;
  maritalStatus: string;
  numberOfKids: number; kidsAges: string;
  auPairTasks: string; hoursPerWeek: string; pocketMoney: string;
  accommodation: string; mealsProvided: boolean;
  description: string;
  preferredGender: string; preferredAgeMin: string; preferredAgeMax: string;
  preferredLanguages: string[];
  phoneCountryCode: string; phoneNumber: string;
};

const EMPTY_PROFILE: Profile = {
  status: "PENDING",
  familyPhotoUrl: "",
  firstName: "", lastName: "",
  country: "", city: "", address: "",
  maritalStatus: "MARRIED",
  numberOfKids: 0, kidsAges: "",
  auPairTasks: "", hoursPerWeek: "", pocketMoney: "",
  accommodation: "", mealsProvided: true,
  description: "",
  preferredGender: "", preferredAgeMin: "", preferredAgeMax: "",
  preferredLanguages: [],
  phoneCountryCode: "", phoneNumber: "",
};

export default function FamilleProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const allCountries = [...originCountries, ...hostCountries];
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/famille")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setProfile(json);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, familyPhotoUrl: data.url }));
      } else {
        setPhotoError(data.error ?? "Erreur lors de l'envoi de la photo.");
      }
    } catch {
      setPhotoError("Erreur lors de l'envoi de la photo.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/famille", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = STATUS_BADGES[profile.status] ?? STATUS_BADGES.PENDING;
  const userName = profile.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} role="famille" userName={userName}>
        <p className="text-gray-500">Chargement du profil...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="famille" userName={userName}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Mon profil</h1>
            <p className="text-gray-500">Votre profil est visible après validation par notre équipe.</p>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        {/* Photo de famille */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Photo de famille</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profile.familyPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.familyPhotoUrl} alt="Photo de famille" className="w-full h-full object-cover object-top" />
                ) : (
                  profile.firstName.charAt(0)
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A2E] rounded-full flex items-center justify-center disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div>
              <p className="font-medium text-[#1A1A2E] text-sm mb-1">Ajouter une photo de famille</p>
              <p className="text-xs text-gray-400 mb-2">JPG ou PNG, max 5 Mo. Une bonne photo augmente vos chances de contact.</p>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                {uploadingPhoto ? "Envoi en cours..." : "Télécharger une photo"}
              </Button>
              {photoError && <p className="text-xs text-red-500 mt-1">{photoError}</p>}
            </div>
          </div>
        </div>

        {/* Infos générales */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Informations générales</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
              <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
              <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pays d&apos;accueil</label>
              <select value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                <option value="">Sélectionner un pays</option>
                {hostCountries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ville</label>
              <input type="text" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
              <input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Statut marital</label>
              <select value={profile.maritalStatus} onChange={e => setProfile({ ...profile, maritalStatus: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                {MARITAL_STATUSES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Enfants & accueil */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Enfants & accueil de l&apos;au pair</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre d&apos;enfants</label>
              <input type="number" min={0} value={profile.numberOfKids} onChange={e => setProfile({ ...profile, numberOfKids: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Âges des enfants</label>
              <input type="text" value={profile.kidsAges} onChange={e => setProfile({ ...profile, kidsAges: e.target.value })}
                placeholder="ex : 3, 6, 9"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Heures par semaine</label>
              <input type="number" min={0} value={profile.hoursPerWeek} onChange={e => setProfile({ ...profile, hoursPerWeek: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Argent de poche (€/mois)</label>
              <input type="number" min={0} value={profile.pocketMoney} onChange={e => setProfile({ ...profile, pocketMoney: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Logement proposé</label>
              <input type="text" value={profile.accommodation} onChange={e => setProfile({ ...profile, accommodation: e.target.value })}
                placeholder="ex : Chambre privée avec salle de bain"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={profile.mealsProvided} onChange={e => setProfile({ ...profile, mealsProvided: e.target.checked })}
                  className="w-4 h-4 accent-[#E87722]" />
                Repas fournis
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tâches confiées à l&apos;au pair</label>
              <textarea value={profile.auPairTasks} onChange={e => setProfile({ ...profile, auPairTasks: e.target.value })}
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Description de la famille</h2>
          <textarea value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })}
            rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none" />
        </div>

        {/* Préférences au pair */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Préférences pour l&apos;au pair</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Genre préféré</label>
              <select value={profile.preferredGender} onChange={e => setProfile({ ...profile, preferredGender: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                <option value="">Indifférent</option>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Âge minimum</label>
              <input type="number" min={18} value={profile.preferredAgeMin} onChange={e => setProfile({ ...profile, preferredAgeMin: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Âge maximum</label>
              <input type="number" min={18} value={profile.preferredAgeMax} onChange={e => setProfile({ ...profile, preferredAgeMax: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Langues souhaitées</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGES.map(lang => (
                <label key={lang} className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all ${
                  profile.preferredLanguages.includes(lang)
                    ? "border-[#E87722] bg-[#FFF3E0] text-[#E87722] font-semibold"
                    : "border-gray-200 text-gray-700 hover:border-[#E87722]"
                }`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={profile.preferredLanguages.includes(lang)}
                    onChange={e => setProfile({
                      ...profile,
                      preferredLanguages: e.target.checked
                        ? [...profile.preferredLanguages, lang]
                        : profile.preferredLanguages.filter(l => l !== lang),
                    })}
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Contact WhatsApp</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro WhatsApp</label>
            <div className="flex gap-2">
              <select value={profile.phoneCountryCode} onChange={e => setProfile({ ...profile, phoneCountryCode: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                {allCountries.map(c => (
                  <option key={c.name} value={c.dialCode}>{c.name} ({c.dialCode})</option>
                ))}
              </select>
              <input type="tel" value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                placeholder="6XX XXX XXX" />
            </div>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex items-center gap-4">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Profil sauvegardé !
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
