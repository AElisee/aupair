"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Heart, Filter, Languages, Star, MapPin, Loader2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SelectField } from "@/components/ui/select-field";

type AuPair = {
  id: string;
  firstName: string;
  profilePhotoUrl: string;
  age: number;
  gender: string;
  country: string;
  flag: string;
  languages: string[];
  experience: number;
  drivingLicense: boolean;
  targetCountries: string[];
  description: string;
  available: boolean;
  isFavorite: boolean;
};

function AuPairCard({ ap, onToggleFavorite }: { ap: AuPair; onToggleFavorite: (id: string, next: boolean) => void }) {
  const { t, tValue, tList } = useI18n();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <Link href={`/dashboard/famille/au-pair/${ap.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center overflow-hidden">
          {ap.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ap.profilePhotoUrl} alt={ap.firstName} className="absolute inset-0 w-full h-full object-cover object-top" />
          ) : (
            <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {ap.firstName.charAt(0)}
            </div>
          )}
          <div className="absolute top-3 right-3">
            {ap.available ? <Badge variant="success">{t.common.available}</Badge> : <Badge variant="warning">{t.common.unavailable}</Badge>}
          </div>
        </div>

        <div className="p-5 pb-3">
          <h3 className="text-base font-medium text-[#1A1A2E]">{ap.firstName}, {t.common.age(ap.age)}</h3>
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
      </Link>

      <div className="px-5 pb-4">
        <button
          type="button"
          onClick={() => onToggleFavorite(ap.id, !ap.isFavorite)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            ap.isFavorite ? "text-[#E87722]" : "text-gray-400 hover:text-[#E87722]"
          }`}
        >
          <Heart className={`w-4 h-4 ${ap.isFavorite ? "fill-current" : ""}`} />
          {ap.isFavorite ? t.common.removeFromFavorites : t.common.addToFavorites}
        </button>
      </div>
    </div>
  );
}

export default function RechercheAuPairPage() {
  const { data: session } = useSession();

  const [auPairs, setAuPairs] = useState<AuPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterMinAge, setFilterMinAge] = useState("");
  const [filterMaxAge, setFilterMaxAge] = useState("");
  const [filterMinExperience, setFilterMinExperience] = useState("");
  const [filterTargetCountry, setFilterTargetCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const { languages: LANGUAGES } = useConstants();
  const { t, tValue } = useI18n();

  useEffect(() => {
    fetch("/api/au-pairs")
      .then((res) => res.json())
      .then((data) => setAuPairs(data.auPairs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => {
    setSearch("");
    setFilterCountry("");
    setFilterLang("");
    setFilterGender("");
    setFilterMinAge("");
    setFilterMaxAge("");
    setFilterMinExperience("");
    setFilterTargetCountry("");
  };

  const handleToggleFavorite = async (id: string, next: boolean) => {
    setAuPairs((prev) => prev.map((ap) => (ap.id === id ? { ...ap, isFavorite: next } : ap)));
    try {
      await fetch(`/api/favorites${next ? "" : `?targetId=${id}`}`, {
        method: next ? "POST" : "DELETE",
        headers: next ? { "Content-Type": "application/json" } : undefined,
        body: next ? JSON.stringify({ targetId: id }) : undefined,
      });
    } catch {
      setAuPairs((prev) => prev.map((ap) => (ap.id === id ? { ...ap, isFavorite: !next } : ap)));
    }
  };

  const filtered = auPairs.filter((ap) => {
    const query = search.toLowerCase();
    const matchSearch =
      ap.firstName.toLowerCase().includes(query) ||
      ap.country.toLowerCase().includes(query) ||
      tValue(ap.country).toLowerCase().includes(query);
    const matchCountry = !filterCountry || ap.country === filterCountry;
    const matchLang = !filterLang || ap.languages.includes(filterLang);
    const matchGender = !filterGender || ap.gender === filterGender;
    const matchMinAge = !filterMinAge || ap.age >= Number(filterMinAge);
    const matchMaxAge = !filterMaxAge || ap.age <= Number(filterMaxAge);
    const matchExperience = !filterMinExperience || ap.experience >= Number(filterMinExperience);
    const matchTargetCountry = !filterTargetCountry || ap.targetCountries.includes(filterTargetCountry);
    return matchSearch && matchCountry && matchLang && matchGender && matchMinAge && matchMaxAge && matchExperience && matchTargetCountry;
  });

  return (
    <DashboardLayout role="famille" userName={session?.user?.name ?? ""}>
      <div className="space-y-6">
        <PageHeader title={t.searchAuPairs.title} subtitle={t.searchAuPairs.availableCount(auPairs.length)} />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchAuPairs.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A2E] px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {t.common.filters}
          </button>
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SelectField
              value={filterCountry}
              onChange={(v) => setFilterCountry(v)}
              options={[
                { value: "", label: t.searchAuPairs.allOriginCountries },
                ...originCountries.map((c) => ({ value: c.name, label: tValue(c.name) })),
              ]}
            />
            <SelectField
              value={filterLang}
              onChange={(v) => setFilterLang(v)}
              options={[
                { value: "", label: t.searchAuPairs.allLanguages },
                ...LANGUAGES.map((l) => ({ value: String(l), label: tValue(l) })),
              ]}
            />
            <SelectField
              value={filterGender}
              onChange={(v) => setFilterGender(v)}
              options={[
                { value: "", label: t.searchAuPairs.allGenders },
                { value: "Femme", label: tValue("Femme") },
                { value: "Homme", label: tValue("Homme") },
              ]}
            />
            <SelectField
              value={filterTargetCountry}
              onChange={(v) => setFilterTargetCountry(v)}
              options={[
                { value: "", label: t.searchAuPairs.allDestinations },
                ...hostCountries.map((c) => ({ value: c.name, label: tValue(c.name) })),
              ]}
            />
            <SelectField
              value={filterMinAge}
              onChange={(v) => setFilterMinAge(v)}
              options={[
                { value: "", label: t.searchAuPairs.minAge },
                ...[18, 20, 22, 25, 28, 30, 35, 40].map((a) => ({ value: String(a), label: t.searchAuPairs.ageOption(a) })),
              ]}
            />
            <SelectField
              value={filterMaxAge}
              onChange={(v) => setFilterMaxAge(v)}
              options={[
                { value: "", label: t.searchAuPairs.maxAge },
                ...[20, 22, 25, 28, 30, 35, 40, 50].map((a) => ({ value: String(a), label: t.searchAuPairs.ageOption(a) })),
              ]}
            />
            <SelectField
              value={filterMinExperience}
              onChange={(v) => setFilterMinExperience(v)}
              options={[
                { value: "", label: t.searchAuPairs.minExperience },
                ...[1, 2, 3, 4, 5].map((y) => ({ value: String(y), label: t.searchAuPairs.experienceOption(y) })),
              ]}
            />
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm">{t.searchAuPairs.foundCount(filtered.length)}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((ap) => <AuPairCard key={ap.id} ap={ap} onToggleFavorite={handleToggleFavorite} />)}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-400">{t.searchAuPairs.noneFound}</p>
                <button onClick={resetFilters} className="mt-4 text-[#E87722] font-semibold text-sm">{t.common.resetFilters}</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
