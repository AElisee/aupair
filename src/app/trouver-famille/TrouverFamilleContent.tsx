"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MessageCircle, RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionBanner as LimitedBanner } from "@/components/dashboard/SubscriptionLock";
import { FamilyCard, FamilyCardSkeleton, type Family, type FamilyViewer } from "@/components/families/FamilyCard";
import { FamilyFilterFields, useFamilySearch, useFamilySortOptions } from "@/components/families/FamilyFilters";
import {
  ActiveFilterChips,
  CountryChips,
  DirectoryEmptyState,
  DirectoryHero,
  FilterPanel,
  FilterSheet,
  ShowMore,
  SortSelect,
  type CountryChip,
} from "@/components/search/DirectoryUI";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export default function TrouverFamilleContent() {
  const { data: session } = useSession();
  const viewer: FamilyViewer = !session?.user ? "guest" : session.user.role === "AU_PAIR" ? "auPair" : "other";

  const [families, setFamilies] = useState<Family[]>([]);
  const [countryTotals, setCountryTotals] = useState<CountryChip[]>();
  const [total, setTotal] = useState(0);
  // Au pair sans abonnement : l'API ne renvoie qu'un échantillon aléatoire de familles
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { host: hostCountries } = useCountries();
  const { languages, subscription } = useConstants();
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
        setTotal(data.total ?? data.families?.length ?? 0);
        setLimited(!!data.limited);
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

  const guestLimitNote = limited && total > families.length ? f.guestLimited(families.length, total) : undefined;

  const filterFields = (
    <FamilyFilterFields filters={s.filters} onChange={s.updateFilters} hostCountries={hostCountries} languages={languages} />
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <DirectoryHero
        title={f.title}
        subtitle={loading || error ? f.subtitleLoading : f.subtitle(total)}
        search={s.search}
        onSearchChange={s.setSearch}
        searchPlaceholder={t.searchFamilies.searchPlaceholder}
        activeCount={s.activeCount}
        onOpenFilters={() => setSheetOpen(true)}
        countryChips={
          s.countryChips.length > 1 && <CountryChips
            chips={s.countryChips}
            value={s.filters.country}
            onChange={(country) => s.updateFilters({ country })}
            variant="dark"
          />
        }
      />

      {/* ─── Résultats ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <FilterPanel activeCount={s.activeCount} onClear={s.clearFilters}>
              {filterFields}
            </FilterPanel>
            {viewer === "guest" && (
              <SubscriptionBanner price={subscription.priceEur} days={subscription.days} limitNote={guestLimitNote} compact />
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {s.countryLimit && viewer !== "other" ? (
            <LimitedBanner
              className="mb-6"
              {...(viewer === "guest"
                ? {
                    message: f.guestCountryLimited(tValue(s.countryLimit.country), s.countryLimit.total, s.countryLimit.shown),
                    href: "/inscription?role=au-pair",
                    cta: f.signUpCta,
                  }
                : {
                    message: t.searchFamilies.countryLimited(tValue(s.countryLimit.country), s.countryLimit.total, s.countryLimit.shown),
                  })}
            />
          ) : (
            viewer === "auPair" &&
            limited &&
            total > families.length && (
              <LimitedBanner className="mb-6" message={t.searchFamilies.limitedBanner(families.length, total)} />
            )
          )}

          {viewer === "guest" && (
            <div className="lg:hidden mb-6">
              <SubscriptionBanner price={subscription.priceEur} days={subscription.days} limitNote={guestLimitNote} />
            </div>
          )}

          {!error && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-gray-600" aria-live="polite">
                {loading ? t.common.loading : t.searchFamilies.foundCount(s.filtered.length)}
              </p>
              <SortSelect value={s.sort} onChange={s.setSort} options={sortOptions} />
            </div>
          )}

          {s.activeChips.length > 0 && (
            <div className="mb-5">
              <ActiveFilterChips chips={s.activeChips} onRemove={(key) => s.updateFilters({ [key]: "" })} />
            </div>
          )}

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
                {s.visible.map((fam) => <FamilyCard key={fam.id} fam={fam} viewer={viewer} />)}
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
        </main>
      </div>

      <FilterSheet open={sheetOpen} onClose={closeSheet} onClear={s.clearFilters} resultLabel={f.showResults(s.filtered.length)}>
        {filterFields}
      </FilterSheet>
    </div>
  );
}

// ─── Blocs secondaires ──────────────────────────────────────────────────────

function SubscriptionBanner({
  price,
  days,
  compact = false,
  limitNote,
}: { price: number; days: number; compact?: boolean; limitNote?: string }) {
  const { t } = useI18n();
  const f = t.findFamily;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-linear-to-br from-[#E87722] to-[#d06619] text-white",
        compact ? "p-5" : "p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
      )}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="relative flex-1">
        <MessageCircle className="w-6 h-6 mb-2 opacity-90" strokeWidth={1.75} />
        <p className="font-semibold">{f.bannerTitle}</p>
        <p className="text-sm text-white/85 mt-1">{f.bannerText(price, days)}</p>
        {limitNote && <p className="text-sm font-medium mt-2">{limitNote}</p>}
      </div>
      <div className={cn("relative flex flex-col gap-2", compact ? "mt-4" : "sm:items-end")}>
        <Link href="/inscription?role=au-pair">
          <Button variant="secondary" className="h-11 w-full">
            {f.bannerCta}
          </Button>
        </Link>
        <Link href="/connexion?callbackUrl=/trouver-famille" className="text-xs text-white/85 hover:text-white text-center underline-offset-2 hover:underline">
          {t.directory.alreadyMember}
        </Link>
      </div>
    </div>
  );
}
