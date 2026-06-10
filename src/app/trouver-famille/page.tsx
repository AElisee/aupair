"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Users, Clock, Lock, Loader2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";

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
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Lock className="w-6 h-6 text-[#E87722] mb-2" />
          <p className="text-sm font-semibold text-[#1A1A2E] mb-3">Voir le profil complet</p>
          <Link href="/inscription?role=au-pair">
            <Button size="sm">S'inscrire — 32€/30j</Button>
          </Link>
        </div>
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
  );
}

export default function TrouverFamillePage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { host: hostCountries } = useCountries();

  useEffect(() => {
    fetch("/api/families")
      .then((res) => res.json())
      .then((data) => setFamilies(data.families ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = families.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.city.toLowerCase().includes(search.toLowerCase()) || f.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || f.country === filterCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div>
      <div className="bg-[#E87722] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Trouver une famille d'accueil
          </h1>
          <p className="text-white/80 mb-6">
            {families.length} familles disponibles · Abonnement 32€/30 jours pour contacter les familles
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ville, pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="mt-4">
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none w-full sm:w-64"
              >
                <option value="">Tous les pays d'accueil</option>
                {hostCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#1A1A2E]">👤 Inscrivez-vous pour contacter les familles</p>
            <p className="text-sm text-gray-500">Abonnement au pair à 32€ pour 30 jours. Messagerie illimitée incluse.</p>
          </div>
          <Link href="/inscription?role=au-pair">
            <Button>S'inscrire — 32€/30j</Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} familles trouvées</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((f) => <FamilyCard key={f.id} fam={f} />)}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Aucune famille trouvée avec ces critères.</p>
                <button onClick={() => { setSearch(""); setFilterCountry(""); }} className="mt-4 text-[#E87722] font-semibold">Réinitialiser les filtres</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
