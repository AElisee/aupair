"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Languages, Star, Lock, Loader2 } from "lucide-react";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";

type AuPair = {
  id: string;
  firstName: string;
  profilePhotoUrl: string;
  age: number;
  country: string;
  flag: string;
  languages: string[];
  experience: number;
  targetCountries: string[];
  description: string;
  available: boolean;
};

function AuPairCard({ ap, isFamily }: { ap: AuPair; isFamily: boolean }) {
  const card = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Photo */}
      <div className="relative h-48 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center overflow-hidden">
        {ap.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ap.profilePhotoUrl} alt={ap.firstName} className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {ap.firstName.charAt(0)}
          </div>
        )}
        {!ap.available && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning">Indisponible</Badge>
          </div>
        )}
        {ap.available && (
          <div className="absolute top-3 right-3">
            <Badge variant="success">Disponible</Badge>
          </div>
        )}
        {/* Overlay CTA si non connecté en tant que famille */}
        {!isFamily && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Lock className="w-6 h-6 text-[#E87722] mb-2" />
            <p className="text-sm font-semibold text-[#1A1A2E] mb-3">Voir le profil complet</p>
            <Link href="/inscription?role=famille">
              <Button size="sm">S'inscrire gratuitement</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-[#1A1A2E] text-lg">{ap.firstName}, {ap.age} ans</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <span>{ap.flag}</span>
              <span>{ap.country}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{ap.description}</p>

        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-[#E87722]" />
            <span>{ap.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[#E87722]" />
            <span>{ap.experience} an{ap.experience > 1 ? "s" : ""} d'expérience</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#E87722]" />
            <span>Souhaite : {ap.targetCountries.join(", ")}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFamily) {
    return <Link href={`/dashboard/famille/au-pair/${ap.id}`} className="block">{card}</Link>;
  }
  return card;
}

export default function TrouverAuPairPage() {
  const { data: session } = useSession();
  const isFamily = session?.user?.role === "FAMILLE";

  const [auPairs, setAuPairs] = useState<AuPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { origin: originCountries } = useCountries();
  const { languages: LANGUAGES } = useConstants();

  useEffect(() => {
    fetch("/api/au-pairs")
      .then((res) => res.json())
      .then((data) => setAuPairs(data.auPairs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = auPairs.filter((ap) => {
    const matchSearch = ap.firstName.toLowerCase().includes(search.toLowerCase()) || ap.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || ap.country === filterCountry;
    const matchLang = !filterLang || ap.languages.includes(filterLang);
    return matchSearch && matchCountry && matchLang;
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-[#1A1A2E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Trouver un au pair africain
          </h1>
          <p className="text-gray-400 mb-6">
            {auPairs.length} au pairs disponibles
            {!isFamily && " • Inscription famille gratuite pour accéder aux profils complets"}
          </p>

          {/* Barre de recherche */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white/10 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {/* Filtres étendus */}
          {showFilters && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              >
                <option value="">Tous les pays d'origine</option>
                {originCountries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              >
                <option value="">Toutes les langues</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grille */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bannière inscription */}
        {!isFamily && (
          <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#1A1A2E]">👨‍👩‍👧 Inscrivez-vous gratuitement pour voir les profils complets</p>
              <p className="text-sm text-gray-500">Accès aux coordonnées, messagerie, favoris — 100% gratuit pour les familles.</p>
            </div>
            <Link href="/inscription?role=famille">
              <Button>Inscription gratuite</Button>
            </Link>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-[#E87722] mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">{filtered.length} au pairs trouvés</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((ap) => <AuPairCard key={ap.id} ap={ap} isFamily={isFamily} />)}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Aucun au pair trouvé avec ces critères.</p>
                <button onClick={() => { setSearch(""); setFilterCountry(""); setFilterLang(""); }} className="mt-4 text-[#E87722] font-semibold">Réinitialiser les filtres</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
