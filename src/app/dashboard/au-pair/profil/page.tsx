"use client";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Search,
  MessageCircle,
  Bell,
  CreditCard,
  Settings,
  Home,
  Camera,
  CheckCircle,
  Loader2,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  {
    href: "/dashboard/au-pair/recherche",
    icon: Search,
    label: "Rechercher une famille",
  },
  {
    href: "/dashboard/au-pair/messages",
    icon: MessageCircle,
    label: "Messages",
  },
  {
    href: "/dashboard/au-pair/notifications",
    icon: Bell,
    label: "Notifications",
  },
  {
    href: "/dashboard/au-pair/abonnement",
    icon: CreditCard,
    label: "Mon abonnement",
  },
  {
    href: "/dashboard/au-pair/parametres",
    icon: Settings,
    label: "Paramètres",
  },
];

const STATUS_BADGES: Record<
  string,
  {
    variant: "warning" | "success" | "secondary" | "destructive";
    label: string;
  }
> = {
  PENDING: { variant: "warning", label: "En attente de validation" },
  ACTIVE: { variant: "success", label: "Profil validé" },
  HIDDEN: { variant: "secondary", label: "Profil masqué" },
  SUSPENDED: { variant: "destructive", label: "Profil suspendu" },
  DELETED: { variant: "destructive", label: "Profil supprimé" },
};

type Profile = {
  status: string;
  profilePhotoUrl: string;
  idDocumentUrls: string[];
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfOrigin: string;
  cityOfOrigin: string;
  languages: string[];
  educationLevel: string;
  childcareExperience: string;
  childcareYears: string;
  firstAidCertified: boolean;
  drivingLicense: boolean;
  targetCountries: string[];
  availableFrom: string;
  availableTo: string;
  preferredDuration: string;
  isSmoker: boolean;
  healthDeclaration: string;
  hasCriminalRecord: boolean;
  description: string;
  motivation: string;
  phoneCountryCode: string;
  phoneNumber: string;
  phoneCountryCode2: string;
  phoneNumber2: string;
};

const EMPTY_PROFILE: Profile = {
  status: "PENDING",
  profilePhotoUrl: "",
  idDocumentUrls: [],
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  countryOfOrigin: "",
  cityOfOrigin: "",
  languages: [],
  educationLevel: "",
  childcareExperience: "",
  childcareYears: "",
  firstAidCertified: false,
  drivingLicense: false,
  targetCountries: [],
  availableFrom: "",
  availableTo: "",
  preferredDuration: "",
  isSmoker: false,
  healthDeclaration: "",
  hasCriminalRecord: false,
  description: "",
  motivation: "",
  phoneCountryCode: "",
  phoneNumber: "",
  phoneCountryCode2: "",
  phoneNumber2: "",
};

export default function AuPairProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const {
    languages: LANGUAGES,
    educationLevels: EDUCATION_LEVELS,
    durations: DURATIONS,
  } = useConstants();
  const allCountries = [...originCountries, ...hostCountries];
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState("");
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/au-pair")
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
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, profilePhotoUrl: data.url }));
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

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDocError("");
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const res = await fetch("/api/profile/id-document", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, idDocumentUrls: data.idDocumentUrls }));
      } else {
        setDocError(data.error ?? "Erreur lors de l'envoi du document.");
      }
    } catch {
      setDocError("Erreur lors de l'envoi du document.");
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  const handleDocDelete = async (url: string) => {
    setDocError("");
    try {
      const res = await fetch("/api/profile/id-document", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, idDocumentUrls: data.idDocumentUrls }));
      } else {
        setDocError(data.error ?? "Erreur lors de la suppression du document.");
      }
    } catch {
      setDocError("Erreur lors de la suppression du document.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile/au-pair", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error ?? "Erreur lors de la sauvegarde du profil.");
      }
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = STATUS_BADGES[profile.status] ?? STATUS_BADGES.PENDING;

  const userName = profile.firstName
    ? `${profile.firstName} ${profile.lastName.charAt(0)}.`
    : "";

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} role="au-pair" userName={userName}>
        <p className="text-gray-500">Chargement du profil...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName={userName}>
      <div className="max-w-3xl space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E]">
              Mon profil
            </h1>
            <p className="text-gray-500">
              Votre profil est visible après validation par notre équipe.
            </p>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>

        {/* Photo de profil */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Photo de profil</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {profile.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhotoUrl}
                    alt="Photo de profil"
                    className="w-full h-full object-cover object-top"
                  />
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
              <p className="font-medium text-[#1A1A2E] text-sm mb-1">
                Ajouter une photo professionnelle
              </p>
              <p className="text-xs text-gray-400 mb-2">
                JPG ou PNG, max 5 Mo. Une bonne photo augmente vos chances de
                contact.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto
                    ? "Envoi en cours..."
                    : "Télécharger une photo"}
                </Button>
                {profile.profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPhoto(true)}
                    className="text-sm font-semibold text-[#E87722] hover:underline"
                  >
                    Voir la photo
                  </button>
                )}
              </div>
              {photoError && (
                <p className="text-xs text-red-500 mt-1">{photoError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pièce d'identité */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Pièce d'identité</h2>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-[#E87722]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1A1A2E] text-sm mb-1">
                {profile.idDocumentUrls.length > 0
                  ? `${profile.idDocumentUrls.length} document${profile.idDocumentUrls.length > 1 ? "s" : ""} envoyé${profile.idDocumentUrls.length > 1 ? "s" : ""}`
                  : "Aucun document envoyé"}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Carte d'identité, passeport ou titre de séjour (recto et verso).
                JPG, PNG ou PDF, max 10 Mo par fichier, 4 documents maximum. Ces
                documents ne sont visibles que par notre équipe.
              </p>

              {profile.idDocumentUrls.length > 0 && (
                <ul className="flex flex-wrap gap-4 mb-3">
                  {profile.idDocumentUrls.map((url, i) => (
                    <li key={url} className="flex items-center gap-2 text-sm">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#E87722] hover:underline"
                      >
                        Document {i + 1}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDocDelete(url)}
                        className="text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => docInputRef.current?.click()}
                disabled={uploadingDoc || profile.idDocumentUrls.length >= 4}
              >
                {uploadingDoc ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Ajouter des documents
                  </>
                )}
              </Button>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleDocChange}
              />
              {docError && (
                <p className="text-xs text-red-500 mt-1">{docError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">
            Informations personnelles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) =>
                  setProfile({ ...profile, dateOfBirth: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Genre *
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                <option value="">Sélectionner</option>
                <option value="Femme">Femme</option>
                <option value="Homme">Homme</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nationalité
              </label>
              <input
                type="text"
                value={profile.nationality}
                onChange={(e) =>
                  setProfile({ ...profile, nationality: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pays d'origine
              </label>
              <select
                value={profile.countryOfOrigin}
                onChange={(e) =>
                  setProfile({ ...profile, countryOfOrigin: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                {originCountries.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ville d'origine
              </label>
              <input
                type="text"
                value={profile.cityOfOrigin}
                onChange={(e) =>
                  setProfile({ ...profile, cityOfOrigin: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Niveau d'études
              </label>
              <select
                value={profile.educationLevel}
                onChange={(e) =>
                  setProfile({ ...profile, educationLevel: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                {EDUCATION_LEVELS.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Langues parlées */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Langues parlées</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <label
                key={lang}
                className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all ${
                  profile.languages.includes(lang)
                    ? "border-[#E87722] bg-[#FFF3E0] text-[#E87722] font-semibold"
                    : "border-gray-200 text-gray-700 hover:border-[#E87722]"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={profile.languages.includes(lang)}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      languages: e.target.checked
                        ? [...profile.languages, lang]
                        : profile.languages.filter((l) => l !== lang),
                    })
                  }
                />
                {lang}
              </label>
            ))}
          </div>
        </div>

        {/* Expérience & qualifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">
            Expérience & qualifications
          </h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expérience (années)
                </label>
                <select
                  value={profile.childcareYears}
                  onChange={(e) =>
                    setProfile({ ...profile, childcareYears: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  {["0", "1", "2", "3", "4", "5+"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Décrivez votre expérience avec les enfants
              </label>
              <textarea
                value={profile.childcareExperience}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    childcareExperience: e.target.value,
                  })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all border-gray-200 text-gray-700 hover:border-[#E87722]">
                <input
                  type="checkbox"
                  className="accent-[#E87722]"
                  checked={profile.firstAidCertified}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      firstAidCertified: e.target.checked,
                    })
                  }
                />
                Certifié(e) premiers secours
              </label>
              <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all border-gray-200 text-gray-700 hover:border-[#E87722]">
                <input
                  type="checkbox"
                  className="accent-[#E87722]"
                  checked={profile.drivingLicense}
                  onChange={(e) =>
                    setProfile({ ...profile, drivingLicense: e.target.checked })
                  }
                />
                Permis de conduire
              </label>
            </div>
          </div>
        </div>

        {/* Disponibilité & destination */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">
            Disponibilité & destination
          </h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Disponible à partir du
                </label>
                <input
                  type="date"
                  value={profile.availableFrom}
                  onChange={(e) =>
                    setProfile({ ...profile, availableFrom: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Disponible jusqu'au
                </label>
                <input
                  type="date"
                  value={profile.availableTo}
                  onChange={(e) =>
                    setProfile({ ...profile, availableTo: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Durée souhaitée
                </label>
                <select
                  value={profile.preferredDuration}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferredDuration: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  <option value="">Sélectionner</option>
                  {DURATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pays de destination souhaités
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hostCountries.map(({ name: country }) => (
                  <label
                    key={country}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all ${
                      profile.targetCountries.includes(country)
                        ? "border-[#E87722] bg-[#FFF3E0] text-[#E87722] font-semibold"
                        : "border-gray-200 text-gray-700 hover:border-[#E87722]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={profile.targetCountries.includes(country)}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          targetCountries: e.target.checked
                            ? [...profile.targetCountries, country]
                            : profile.targetCountries.filter(
                                (c) => c !== country,
                              ),
                        })
                      }
                    />
                    {country}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description & Motivation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">
            Description & Motivation
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Présentation personnelle
              </label>
              <textarea
                value={profile.description}
                onChange={(e) =>
                  setProfile({ ...profile, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pourquoi souhaitez-vous devenir au pair ?
              </label>
              <textarea
                value={profile.motivation}
                onChange={(e) =>
                  setProfile({ ...profile, motivation: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Santé & déclarations */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">
            Santé & déclarations
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all border-gray-200 text-gray-700 hover:border-[#E87722]">
                <input
                  type="checkbox"
                  className="accent-[#E87722]"
                  checked={profile.isSmoker}
                  onChange={(e) =>
                    setProfile({ ...profile, isSmoker: e.target.checked })
                  }
                />
                Fumeur(se)
              </label>
              <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all border-gray-200 text-gray-700 hover:border-[#E87722]">
                <input
                  type="checkbox"
                  className="accent-[#E87722]"
                  checked={profile.hasCriminalRecord}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      hasCriminalRecord: e.target.checked,
                    })
                  }
                />
                Casier judiciaire non vierge
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Déclaration de santé (allergies, traitements, etc.)
              </label>
              <textarea
                value={profile.healthDeclaration}
                onChange={(e) =>
                  setProfile({ ...profile, healthDeclaration: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Contact WhatsApp</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Numéro WhatsApp principal
              </label>
              <div className="flex gap-2">
                <select
                  value={profile.phoneCountryCode}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneCountryCode: e.target.value })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  {allCountries.map((c) => (
                    <option key={c.name} value={c.dialCode}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber: e.target.value })
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="6XX XXX XXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Numéro WhatsApp secondaire (optionnel)
              </label>
              <div className="flex gap-2">
                <select
                  value={profile.phoneCountryCode2}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phoneCountryCode2: e.target.value,
                    })
                  }
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  {allCountries.map((c) => (
                    <option key={c.name} value={c.dialCode}>
                      {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={profile.phoneNumber2}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber2: e.target.value })
                  }
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="6XX XXX XXX"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bouton sauvegarder (sticky) */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
          </Button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Profil sauvegardé !
            </div>
          )}
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
        </div>
      </div>

      {showPhoto && profile.profilePhotoUrl && (
        <PhotoViewerModal
          url={profile.profilePhotoUrl}
          onClose={() => setShowPhoto(false)}
        />
      )}
    </DashboardLayout>
  );
}
