"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Home,
  User,
  Search,
  MessageCircle,
  Bell,
  CreditCard,
  Settings,
  Filter,
  MapPin,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

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
            <span>{fam.city}, {fam.country}</span>
          </div>

          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{fam.description}</p>

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#E87722]" />
              <span>
                {fam.kids} enfant{fam.kids > 1 ? "s" : ""}
                {fam.kidsAges.length > 0 ? ` (${fam.kidsAges.join(", ")} ans)` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E87722]" />
              <span>{fam.hoursPerWeek}h/semaine · {fam.pocketMoney}€/mois</span>
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
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.city.toLowerCase().includes(search.toLowerCase()) || f.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || f.country === filterCountry;
    const matchMinKids = !filterMinKids || f.kids >= Number(filterMinKids);
    const matchMinPocketMoney = !filterMinPocketMoney || f.pocketMoney >= Number(filterMinPocketMoney);
    const matchLang = !filterLang || f.languages.includes(filterLang);
    return matchSearch && matchCountry && matchMinKids && matchMinPocketMoney && matchLang;
  });

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName={session?.user?.name ?? ""}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Rechercher une famille d&apos;accueil</h1>
          <p className="text-gray-500">{families.length} familles disponibles</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ville, pays..."
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
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">Tous les pays d&apos;accueil</option>
              {hostCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">Toutes les langues souhaitées</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              value={filterMinKids}
              onChange={(e) => setFilterMinKids(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">Nombre d&apos;enfants min.</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
            <select
              value={filterMinPocketMoney}
              onChange={(e) => setFilterMinPocketMoney(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
            >
              <option value="">Argent de poche min.</option>
              {[100, 200, 300, 400, 500].map((m) => <option key={m} value={m}>{m}€+</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm">{filtered.length} familles trouvées</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((f) => <FamilyCard key={f.id} fam={f} />)}
            </div>

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <p className="text-gray-400">Aucune famille trouvée avec ces critères.</p>
                <button onClick={resetFilters} className="mt-4 text-[#E87722] font-semibold text-sm">Réinitialiser les filtres</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
