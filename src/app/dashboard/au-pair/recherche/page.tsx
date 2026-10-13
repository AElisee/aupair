"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Filter, MapPin, Users, Clock, Loader2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { useI18n } from "@/i18n";

type Family = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  kids: number;
  kidsAges: number[];
  tasks: string;
  hoursPerWeek: number;
  pocketMoney: number;
  languages: string[];
  description: string;
  familyPhotoUrl: string;
};

function FamilyCard({ fam }: { fam: Family }) {
  const { t, tValue } = useI18n();
  return (
    <Link href={`/dashboard/au-pair/famille/${fam.id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
        <div className="relative h-36 bg-linear-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center overflow-hidden">
          {fam.familyPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fam.familyPhotoUrl} alt={fam.name} className="absolute inset-0 w-full h-full object-cover object-top" />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-1">{fam.flag}</div>
              <p className="text-white font-bold">{fam.city}</p>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">{fam.name}</h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{fam.city}, {tValue(fam.country)}</span>
          </div>

          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{fam.description}</p>

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#E87722]" />
              <span>
                {t.common.kids(fam.kids)}
                {fam.kidsAges.length > 0 ? t.common.kidsAges(fam.kidsAges.join(", ")) : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E87722]" />
              <span>{t.common.hoursPerWeek(fam.hoursPerWeek)} · {t.common.pocketMoney(fam.pocketMoney)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RechercheFamillePage() {
  const { data: session } = useSession();

  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterMinKids, setFilterMinKids] = useState("");
  const [filterMinPocketMoney, setFilterMinPocketMoney] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { host: hostCountries } = useCountries();
  const { languages: LANGUAGES } = useConstants();
  const { t, tValue } = useI18n();

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families ?? []))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => {
    setSearch("");
    setFilterCountry("");
    setFilterMinKids("");
    setFilterMinPocketMoney("");
    setFilterLang("");
  };

  const filtered = families.filter((f) => {
    const query = search.toLowerCase();
    const matchSearch =
      f.name.toLowerCase().includes(query) ||
      f.city.toLowerCase().includes(query) ||
      f.country.toLowerCase().includes(query) ||
      tValue(f.country).toLowerCase().includes(query);
    const matchCountry = !filterCountry || f.country === filterCountry;
    const matchMinKids = !filterMinKids || f.kids >= Number(filterMinKids);
    const matchMinPocketMoney = !filterMinPocketMoney || f.pocketMoney >= Number(filterMinPocketMoney);
    const matchLang = !filterLang || f.languages.includes(filterLang);
    return matchSearch && matchCountry && matchMinKids && matchMinPocketMoney && matchLang;
  });

  return (
    <DashboardLayout role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">{t.searchFamilies.title}</h1>
          <p className="text-gray-500">{t.searchFamilies.availableCount(families.length)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchFamilies.searchPlaceholder}
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
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">{t.searchFamilies.allHostCountries}</option>
              {hostCountries.map((c) => <option key={c.name} value={c.name}>{tValue(c.name)}</option>)}
            </select>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">{t.searchFamilies.allLanguagesWanted}</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{tValue(l)}</option>)}
            </select>
            <select
              value={filterMinKids}
              onChange={(e) => setFilterMinKids(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">{t.searchFamilies.minKids}</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
            <select
              value={filterMinPocketMoney}
              onChange={(e) => setFilterMinPocketMoney(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">{t.searchFamilies.minPocketMoney}</option>
              {[100, 200, 300, 400, 500].map((m) => <option key={m} value={m}>{m}€+</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">{t.common.loading}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm">{t.searchFamilies.foundCount(filtered.length)}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((f) => <FamilyCard key={f.id} fam={f} />)}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-400">{t.searchFamilies.noneFound}</p>
                <button onClick={resetFilters} className="mt-4 text-[#E87722] font-semibold text-sm">{t.common.resetFilters}</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
