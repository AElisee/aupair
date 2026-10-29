"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RotateCcw, Search, SearchX, SlidersHorizontal } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionBanner } from "@/components/dashboard/SubscriptionLock";
import { Button } from "@/components/ui/button";
import { FamilyCard, FamilyCardSkeleton, type Family } from "@/components/families/FamilyCard";
import { FamilyFilterFields, useFamilySearch, useFamilySortOptions } from "@/components/families/FamilyFilters";
import {
  ActiveFilterChips,
  CountryChips,
  DirectoryEmptyState,
  FilterSheet,
  ShowMore,
  SortSelect,
  type CountryChip,
} from "@/components/search/DirectoryUI";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { useI18n } from "@/i18n";

export default function RechercheFamillePage() {
  const { data: session } = useSession();

  const [families, setFamilies] = useState<Family[]>([]);
  const [countryTotals, setCountryTotals] = useState<CountryChip[]>();
  // Au pair sans abonnement : l'API ne renvoie qu'un échantillon aléatoire de familles
  const [limited, setLimited] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { host: hostCountries } = useCountries();
  const { languages } = useConstants();
  const { t, tValue } = useI18n();
  const f = t.findFamily;
  const d = t.directory;
  const s = useFamilySearch(families, countryTotals);
  const sortOptions = useFamilySortOptions();

  const load = useCallback(() => {
    fetch("/api/families")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setFamilies(data.families ?? []);
        setCountryTotals(data.countries);
        setLimited(data.limited ? { total: data.total ?? 0 } : null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const retry = () => {
    setLoading(true);
    setError(false);
    load();
  };

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const filterFields = (className?: string) => (
    <FamilyFilterFields
      filters={s.filters}
      onChange={s.updateFilters}
      hostCountries={hostCountries}
      languages={languages}
      className={className}
    />
  );

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-5">
        <PageHeader
          title={t.searchFamilies.title}
          subtitle={
            loading || error ? f.subtitleLoading : t.searchFamilies.availableCount(limited ? limited.total : families.length)
          }
        />

        {s.countryLimit ? (
          <SubscriptionBanner
            message={t.searchFamilies.countryLimited(tValue(s.countryLimit.country), s.countryLimit.total, s.countryLimit.shown)}
          />
        ) : (
          limited &&
          limited.total > families.length && (
            <SubscriptionBanner message={t.searchFamilies.limitedBanner(families.length, limited.total)} />
          )
        )}

        {/* ─── Recherche + filtres ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                inputMode="search"
                placeholder={t.searchFamilies.searchPlaceholder}
                aria-label={t.searchFamilies.searchPlaceholder}
                value={s.search}
                onChange={(e) => s.setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={t.common.filters}
              className="lg:hidden relative h-12 px-4 flex items-center gap-2 rounded-xl border border-gray-200 text-[#1A1A2E] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5 text-[#E87722]" />
              <span className="hidden sm:inline">{t.common.filters}</span>
              {s.activeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#E87722] text-white text-[11px] font-semibold flex items-center justify-center">
                  {s.activeCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {filterFields("flex-1 grid grid-cols-4 gap-3")}
            {s.activeCount > 0 && (
              <button type="button" onClick={s.clearFilters} className="shrink-0 text-xs font-medium text-[#E87722] hover:underline">
                {d.clearAll}
              </button>
            )}
          </div>
        </div>

        <CountryChips
          chips={s.countryChips}
          value={s.filters.country}
          onChange={(country) => s.updateFilters({ country })}
          variant="light"
          className="-mx-4 px-4 sm:mx-0 sm:px-0"
        />

        {/* ─── Résultats ───────────────────────────────────────────────── */}
        {!error && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" aria-live="polite">
              {loading ? t.common.loading : t.searchFamilies.foundCount(s.filtered.length)}
            </p>
            <SortSelect value={s.sort} onChange={s.setSort} options={sortOptions} />
          </div>
        )}

        <ActiveFilterChips chips={s.activeChips} onRemove={(key) => s.updateFilters({ [key]: "" })} />

        {error ? (
          <DirectoryEmptyState icon={RotateCcw} title={f.loadError} action={<Button onClick={retry}>{d.retry}</Button>} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }, (_, i) => <FamilyCardSkeleton key={i} />)}
          </div>
        ) : s.filtered.length === 0 ? (
          <DirectoryEmptyState
            icon={SearchX}
            title={t.searchFamilies.noneFound}
            text={d.emptyHint}
            action={
              s.hasCriteria && (
                <Button variant="outline" onClick={s.resetAll}>
                  {t.common.resetFilters}
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {s.visible.map((fam) => <FamilyCard key={fam.id} fam={fam} viewer="auPair" />)}
            </div>

            {s.paginated && (
              <ShowMore
                shownLabel={f.shownCount(s.visible.length, s.filtered.length)}
                moreLabel={f.showMore}
                canShowMore={s.visible.length < s.filtered.length}
                onShowMore={s.showMore}
              />
            )}
          </>
        )}
      </div>

      <FilterSheet open={sheetOpen} onClose={closeSheet} onClear={s.clearFilters} resultLabel={f.showResults(s.filtered.length)}>
        {filterFields()}
      </FilterSheet>
    </DashboardLayout>
  );
}
