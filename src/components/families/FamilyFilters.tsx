"use client";

import { useCallback, useMemo, useState } from "react";
import { FilterFields, buildCountryChips, type FilterFieldDef } from "@/components/search/DirectoryUI";
import { useI18n } from "@/i18n";
import type { Family } from "./FamilyCard";

export type FamilyFilters = { country: string; lang: string; minKids: string; minPocketMoney: string };
export type FamilySortKey = "recent" | "pocketMoney" | "kids";

export const EMPTY_FAMILY_FILTERS: FamilyFilters = { country: "", lang: "", minKids: "", minPocketMoney: "" };
const PAGE_SIZE = 12;
const KIDS_OPTIONS = [1, 2, 3, 4, 5];
const POCKET_MONEY_OPTIONS = [100, 200, 300, 400, 500];

/** Recherche, filtres, tri et pagination « voir plus » partagés par /trouver-famille et /dashboard/au-pair/recherche */
export function useFamilySearch(families: Family[]) {
  const { t, tValue } = useI18n();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FamilyFilters>(EMPTY_FAMILY_FILTERS);
  const [sort, setSort] = useState<FamilySortKey>("recent");
  const [limit, setLimit] = useState({ key: "", n: PAGE_SIZE });

  const updateFilters = useCallback((patch: Partial<FamilyFilters>) => setFilters((prev) => ({ ...prev, ...patch })), []);
  const clearFilters = useCallback(() => setFilters(EMPTY_FAMILY_FILTERS), []);
  const resetAll = useCallback(() => {
    setSearch("");
    setFilters(EMPTY_FAMILY_FILTERS);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = families.filter((fam) => {
      const matchSearch =
        !query ||
        fam.name.toLowerCase().includes(query) ||
        fam.city.toLowerCase().includes(query) ||
        fam.country.toLowerCase().includes(query) ||
        tValue(fam.country).toLowerCase().includes(query);
      return (
        matchSearch &&
        (!filters.country || fam.country === filters.country) &&
        (!filters.lang || fam.languages.includes(filters.lang)) &&
        (!filters.minKids || fam.kids >= Number(filters.minKids)) &&
        (!filters.minPocketMoney || fam.pocketMoney >= Number(filters.minPocketMoney))
      );
    });
    // L'API renvoie déjà les familles de la plus récente à la plus ancienne
    if (sort === "pocketMoney") return [...list].sort((a, b) => b.pocketMoney - a.pocketMoney);
    if (sort === "kids") return [...list].sort((a, b) => b.kids - a.kids);
    return list;
  }, [families, search, filters, sort, tValue]);

  const countryChips = useMemo(() => buildCountryChips(families, (fam) => fam.country, (fam) => fam.flag), [families]);

  // Le nombre de cartes affichées repart à PAGE_SIZE dès que la recherche change
  const filterKey = JSON.stringify([search, filters, sort]);
  const visibleCount = limit.key === filterKey ? limit.n : PAGE_SIZE;
  const visible = filtered.slice(0, visibleCount);
  const activeCount = Object.values(filters).filter(Boolean).length;

  const activeChips = (Object.keys(filters) as (keyof FamilyFilters)[])
    .filter((key) => filters[key])
    .map((key) => {
      const value = filters[key];
      const label =
        key === "country" || key === "lang"
          ? tValue(value)
          : key === "minKids"
            ? `${t.searchFamilies.minKids} : ${value}+`
            : `${t.searchFamilies.minPocketMoney} : ${t.findFamily.euroValue(Number(value))}+`;
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

export function FamilyFilterFields({
  filters,
  onChange,
  hostCountries,
  languages,
  className,
}: {
  filters: FamilyFilters;
  onChange: (patch: Partial<FamilyFilters>) => void;
  hostCountries: { name: string }[];
  languages: string[];
  className?: string;
}) {
  const { t, tValue } = useI18n();
  const s = t.searchFamilies;
  const fields: FilterFieldDef<keyof FamilyFilters>[] = [
    { key: "country", label: s.allHostCountries, options: hostCountries.map((c) => ({ value: c.name, label: tValue(c.name) })) },
    { key: "lang", label: s.allLanguagesWanted, options: languages.map((l) => ({ value: l, label: tValue(l) })) },
    { key: "minKids", label: s.minKids, options: KIDS_OPTIONS.map((n) => ({ value: String(n), label: `${n}+` })) },
    {
      key: "minPocketMoney",
      label: s.minPocketMoney,
      options: POCKET_MONEY_OPTIONS.map((m) => ({ value: String(m), label: `${t.findFamily.euroValue(m)}+` })),
    },
  ];

  return <FilterFields fields={fields} values={filters} onChange={onChange} className={className} />;
}

/** Options du tri des familles */
export function useFamilySortOptions(): { value: FamilySortKey; label: string }[] {
  const { t } = useI18n();
  const f = t.findFamily;
  return [
    { value: "recent", label: f.sortRecent },
    { value: "pocketMoney", label: f.sortPocketMoney },
    { value: "kids", label: f.sortKids },
  ];
}
