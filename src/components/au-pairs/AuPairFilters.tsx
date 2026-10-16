"use client";

import { useCallback, useMemo, useState } from "react";
import { FilterFields, buildCountryChips, type FilterFieldDef } from "@/components/search/DirectoryUI";
import { useI18n } from "@/i18n";
import type { AuPair } from "./AuPairCard";

export type AuPairFilters = {
  country: string;
  lang: string;
  gender: string;
  target: string;
  minAge: string;
  maxAge: string;
  minExperience: string;
};
export type AuPairSortKey = "recent" | "experience" | "available";

export const EMPTY_AU_PAIR_FILTERS: AuPairFilters = {
  country: "",
  lang: "",
  gender: "",
  target: "",
  minAge: "",
  maxAge: "",
  minExperience: "",
};
const PAGE_SIZE = 12;
const MIN_AGE_OPTIONS = [18, 20, 22, 25, 28, 30, 35, 40];
const MAX_AGE_OPTIONS = [20, 22, 25, 28, 30, 35, 40, 50];
const EXPERIENCE_OPTIONS = [1, 2, 3, 4, 5];
const GENDERS = ["Femme", "Homme"];

/** Recherche, filtres, tri et pagination « voir plus » de l'annuaire des au pairs */
export function useAuPairSearch(auPairs: AuPair[]) {
  const { t, tValue } = useI18n();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AuPairFilters>(EMPTY_AU_PAIR_FILTERS);
  const [sort, setSort] = useState<AuPairSortKey>("recent");
  const [limit, setLimit] = useState({ key: "", n: PAGE_SIZE });

  const updateFilters = useCallback((patch: Partial<AuPairFilters>) => setFilters((prev) => ({ ...prev, ...patch })), []);
  const clearFilters = useCallback(() => setFilters(EMPTY_AU_PAIR_FILTERS), []);
  const resetAll = useCallback(() => {
    setSearch("");
    setFilters(EMPTY_AU_PAIR_FILTERS);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = auPairs.filter((ap) => {
      const matchSearch =
        !query ||
        ap.firstName.toLowerCase().includes(query) ||
        ap.country.toLowerCase().includes(query) ||
        tValue(ap.country).toLowerCase().includes(query);
      return (
        matchSearch &&
        (!filters.country || ap.country === filters.country) &&
        (!filters.lang || ap.languages.includes(filters.lang)) &&
        (!filters.gender || ap.gender === filters.gender) &&
        (!filters.target || ap.targetCountries.includes(filters.target)) &&
        (!filters.minAge || ap.age >= Number(filters.minAge)) &&
        (!filters.maxAge || ap.age <= Number(filters.maxAge)) &&
        (!filters.minExperience || ap.experience >= Number(filters.minExperience))
      );
    });
    // L'API renvoie déjà les au pairs du plus récent au plus ancien
    if (sort === "experience") return [...list].sort((a, b) => b.experience - a.experience);
    if (sort === "available") return [...list].sort((a, b) => Number(b.available) - Number(a.available));
    return list;
  }, [auPairs, search, filters, sort, tValue]);

  const countryChips = useMemo(() => buildCountryChips(auPairs, (ap) => ap.country, (ap) => ap.flag), [auPairs]);

  // Le nombre de cartes affichées repart à PAGE_SIZE dès que la recherche change
  const filterKey = JSON.stringify([search, filters, sort]);
  const visibleCount = limit.key === filterKey ? limit.n : PAGE_SIZE;
  const visible = filtered.slice(0, visibleCount);
  const activeCount = Object.values(filters).filter(Boolean).length;

  const s = t.searchAuPairs;
  const activeChips = (Object.keys(filters) as (keyof AuPairFilters)[])
    .filter((key) => filters[key])
    .map((key) => {
      const value = filters[key];
      const label =
        key === "minAge"
          ? `${s.minAge} : ${s.ageOption(Number(value))}`
          : key === "maxAge"
            ? `${s.maxAge} : ${s.ageOption(Number(value))}`
            : key === "minExperience"
              ? s.experienceOption(Number(value))
              : tValue(value);
      return { key, label };
    });

  return {
    search,
    setSearch,
    filters,
    updateFilters,
    clearFilters,
    resetAll,
    sort,
    setSort,
    filtered,
    visible,
    paginated: filtered.length > PAGE_SIZE,
    showMore: () => setLimit({ key: filterKey, n: visibleCount + PAGE_SIZE }),
    countryChips,
    activeChips,
    activeCount,
    hasCriteria: activeCount > 0 || search.trim() !== "",
  };
}

export function AuPairFilterFields({
  filters,
  onChange,
  originCountries,
  hostCountries,
  languages,
  className,
}: {
  filters: AuPairFilters;
  onChange: (patch: Partial<AuPairFilters>) => void;
  originCountries: { name: string }[];
  hostCountries: { name: string }[];
  languages: string[];
  className?: string;
}) {
  const { t, tValue } = useI18n();
  const s = t.searchAuPairs;
  const fields: FilterFieldDef<keyof AuPairFilters>[] = [
    { key: "country", label: s.allOriginCountries, options: originCountries.map((c) => ({ value: c.name, label: tValue(c.name) })) },
    { key: "target", label: s.allDestinations, options: hostCountries.map((c) => ({ value: c.name, label: tValue(c.name) })) },
    { key: "lang", label: s.allLanguages, options: languages.map((l) => ({ value: l, label: tValue(l) })) },
    { key: "gender", label: s.allGenders, options: GENDERS.map((g) => ({ value: g, label: tValue(g) })) },
    { key: "minAge", label: s.minAge, options: MIN_AGE_OPTIONS.map((a) => ({ value: String(a), label: s.ageOption(a) })) },
    { key: "maxAge", label: s.maxAge, options: MAX_AGE_OPTIONS.map((a) => ({ value: String(a), label: s.ageOption(a) })) },
    {
      key: "minExperience",
      label: s.minExperience,
      options: EXPERIENCE_OPTIONS.map((y) => ({ value: String(y), label: s.experienceOption(y) })),
    },
  ];

  return <FilterFields fields={fields} values={filters} onChange={onChange} className={className} />;
}

/** Options du tri des au pairs */
export function useAuPairSortOptions(): { value: AuPairSortKey; label: string }[] {
  const { t } = useI18n();
  const f = t.findAuPair;
  return [
    { value: "recent", label: f.sortRecent },
    { value: "experience", label: f.sortExperience },
    { value: "available", label: f.sortAvailable },
  ];
}
