"use client";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, Loader2, FileText, Upload, X } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import PhotoViewerModal from "@/components/ui/photo-viewer-modal";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/dashboard/PageHeader";

type ProfileStatus = "PENDING" | "ACTIVE" | "HIDDEN" | "SUSPENDED" | "DELETED";

const STATUS_VARIANTS: Record<ProfileStatus, "warning" | "success" | "secondary" | "destructive"> = {
  PENDING: "warning",
  ACTIVE: "success",
  HIDDEN: "secondary",
  SUSPENDED: "destructive",
  DELETED: "destructive",
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
  const { t, tValue, tError } = useI18n();
  const tp = t.auPairProfile;

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
        setPhotoError(tError(data.error, t.profileForm.photoUploadError));
      }
    } catch {
      setPhotoError(t.profileForm.photoUploadError);
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
        setDocError(tError(data.error, tp.docUploadError));
      }
    } catch {
      setDocError(tp.docUploadError);
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
        setDocError(tError(data.error, tp.docDeleteError));
      }
    } catch {
      setDocError(tp.docDeleteError);
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
        setSaveError(tError(data?.error, t.profileForm.saveError));
      }
    } finally {
      setSaving(false);
    }
  };

  const status: ProfileStatus = profile.status in STATUS_VARIANTS ? (profile.status as ProfileStatus) : "PENDING";

  const userName = profile.firstName
    ? `${profile.firstName} ${profile.lastName.charAt(0)}.`
    : "";

  if (loading) {
    return (
      <DashboardLayout role="au-pair" userName={userName}>
        <p className="text-gray-500">{t.profileForm.loading}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="au-pair" userName={userName}>
      <div className="max-w-3xl space-y-6 pb-24">
        <PageHeader
          title={t.profileForm.title}
          subtitle={t.profileForm.visibleAfterValidation}
          action={<Badge variant={STATUS_VARIANTS[status]}>{t.profileStatus[status]}</Badge>}
        />

        {/* Photo de profil */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-4">{tp.photoTitle}</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-semibold overflow-hidden">
                {profile.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhotoUrl}
                    alt={tp.photoTitle}
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
                {tp.addPhoto}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {t.profileForm.photoHint}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? t.profileForm.uploading : t.profileForm.uploadPhoto}
                </Button>
                {profile.profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowPhoto(true)}
                    className="text-sm font-semibold text-[#E87722] hover:underline"
                  >
                    {t.profileForm.viewPhoto}
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
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-4">{tp.idTitle}</h2>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#FFF3E0] flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-[#E87722]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#1A1A2E] text-sm mb-1">
                {profile.idDocumentUrls.length > 0
                  ? tp.docsSent(profile.idDocumentUrls.length)
                  : tp.noDocs}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                {tp.idHint}
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
                        {tp.documentN(i + 1)}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDocDelete(url)}
                        className="text-gray-400 hover:text-red-500"
                        title={t.common.delete}
                        aria-label={t.common.delete}
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
                  t.profileForm.uploading
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    {tp.addDocuments}
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
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">
            {tp.personalInfo}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {t.profileForm.firstName}
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
                {t.profileForm.lastName}
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
                {tp.dateOfBirth}
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
                {tp.genderRequired}
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                <option value="">{t.common.select}</option>
                <option value="Femme">{tValue("Femme")}</option>
                <option value="Homme">{tValue("Homme")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.nationality}
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
                {tp.countryOfOrigin}
              </label>
              <select
                value={profile.countryOfOrigin}
                onChange={(e) =>
                  setProfile({ ...profile, countryOfOrigin: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                {originCountries.map((c) => (
                  <option key={c.name} value={c.name}>{tValue(c.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.cityOfOrigin}
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
                {tp.educationLevel}
              </label>
              <select
                value={profile.educationLevel}
                onChange={(e) =>
                  setProfile({ ...profile, educationLevel: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
              >
                {EDUCATION_LEVELS.map((e) => (
                  <option key={e} value={e}>{tValue(e)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Langues parlées */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">{tp.spokenLanguages}</h2>
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
                {tValue(lang)}
              </label>
            ))}
          </div>
        </div>

        {/* Expérience & qualifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">
            {tp.experienceQualifications}
          </h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {tp.experienceYears}
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
                {tp.describeExperience}
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
                {tp.firstAidCertified}
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
                {tp.drivingLicense}
              </label>
            </div>
          </div>
        </div>

        {/* Disponibilité & destination */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">
            {tp.availability}
          </h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {tp.availableFrom}
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
                  {tp.availableTo}
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
                  {tp.preferredDuration}
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
                  <option value="">{t.common.select}</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{tValue(d)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {tp.targetCountries}
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
                    {tValue(country)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description & Motivation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">
            {tp.descriptionMotivation}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.personalPresentation}
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
                {tp.whyAuPair}
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
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">
            {tp.healthDeclarations}
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
                {tp.smoker}
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
                {tp.criminalRecord}
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.healthDeclaration}
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
          <h2 className="text-[15px] font-medium text-[#1A1A2E] mb-5">{t.profileForm.whatsappTitle}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.whatsappMain}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={profile.phoneCountryCode}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneCountryCode: e.target.value })
                  }
                  className="w-full sm:w-auto min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  {allCountries.map((c) => (
                    <option key={c.name} value={c.dialCode}>
                      {tValue(c.name)} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber: e.target.value })
                  }
                  className="w-full sm:flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  placeholder="6XX XXX XXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {tp.whatsappSecondary}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={profile.phoneCountryCode2}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phoneCountryCode2: e.target.value,
                    })
                  }
                  className="w-full sm:w-auto min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                >
                  {allCountries.map((c) => (
                    <option key={c.name} value={c.dialCode}>
                      {tValue(c.name)} ({c.dialCode})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={profile.phoneNumber2}
                  onChange={(e) =>
                    setProfile({ ...profile, phoneNumber2: e.target.value })
                  }
                  className="w-full sm:flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
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
            {saving ? t.profileForm.saving : t.profileForm.saveChanges}
          </Button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> {t.profileForm.saved}
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
