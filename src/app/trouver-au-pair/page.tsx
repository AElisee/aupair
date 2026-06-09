"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Languages, Star, Lock } from "lucide-react";
import { COUNTRIES_ORIGIN, LANGUAGES } from "@/lib/constants";

// Données fictives pour la démo
const mockAuPairs = [
  { id: "1", firstName: "Aminata", age: 23, country: "Cameroun", flag: "🇨🇲", languages: ["Français", "Anglais"], experience: 3, targetCountries: ["France", "Belgique"], description: "Passionnée par les enfants, j'ai 3 ans d'expérience en garde d'enfants. Je parle couramment français et anglais.", available: true, isPremium: true },
  { id: "2", firstName: "Kofi", age: 25, country: "Ghana", flag: "🇬🇭", languages: ["Anglais", "Français"], experience: 2, targetCountries: ["Allemagne", "Suisse"], description: "Jeune dynamique avec 2 ans d'expérience auprès d'enfants de 2 à 10 ans.", available: true, isPremium: false },
  { id: "3", firstName: "Fatou", age: 22, country: "Sénégal", flag: "🇸🇳", languages: ["Français"], experience: 1, targetCountries: ["France", "Luxembourg"], description: "Diplômée en éducation de la petite enfance, je cherche une famille accueillante.", available: true, isPremium: true },
  { id: "4", firstName: "Yves", age: 27, country: "Côte d'Ivoire", flag: "🇨🇮", languages: ["Français", "Anglais"], experience: 4, targetCountries: ["France", "Suisse"], description: "Expérimenté avec les enfants, je suis titulaire du permis de conduire et du certificat de premiers secours.", available: false, isPremium: true },
  { id: "5", firstName: "Bénédicte", age: 24, country: "Bénin", flag: "🇧🇯", languages: ["Français"], experience: 2, targetCountries: ["France", "Belgique"], description: "Jeune femme souriante, patiente et aimant les enfants. Disponible dès juin 2026.", available: true, isPremium: false },
  { id: "6", firstName: "Samuel", age: 26, country: "Madagascar", flag: "🇲🇬", languages: ["Français", "Malgache"], experience: 3, targetCountries: ["France"], description: "Fort de 3 ans d'expérience en babysitting et aide aux devoirs.", available: true, isPremium: true },
  { id: "7", firstName: "Chloé", age: 21, country: "Togo", flag: "🇹🇬", languages: ["Français", "Anglais"], experience: 1, targetCountries: ["Allemagne", "Belgique"], description: "Motivée et sérieuse, je cherche ma première expérience au pair.", available: true, isPremium: false },
  { id: "8", firstName: "Ibrahim", age: 28, country: "Mali", flag: "🇲🇱", languages: ["Français"], experience: 5, targetCountries: ["France", "Luxembourg"], description: "5 ans d'expérience avec des enfants de tout âge. Références disponibles sur demande.", available: true, isPremium: true },
];

function AuPairCard({ ap }: { ap: typeof mockAuPairs[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Photo */}
      <div className="relative h-48 bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center">
        <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {ap.firstName.charAt(0)}
        </div>
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
        {/* Overlay CTA si non connecté */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Lock className="w-6 h-6 text-[#E87722] mb-2" />
          <p className="text-sm font-semibold text-[#1A1A2E] mb-3">Voir le profil complet</p>
          <Link href="/inscription?role=famille">
            <Button size="sm">S'inscrire gratuitement</Button>
          </Link>
        </div>
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
}

export default function TrouverAuPairPage() {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockAuPairs.filter((ap) => {
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
            {mockAuPairs.length} au pairs disponibles • Inscription famille gratuite pour accéder aux profils complets
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
                {COUNTRIES_ORIGIN.map((c) => <option key={c} value={c}>{c}</option>)}
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
        <div className="bg-[#FFF3E0] border border-[#E87722]/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#1A1A2E]">👨‍👩‍👧 Inscrivez-vous gratuitement pour voir les profils complets</p>
            <p className="text-sm text-gray-500">Accès aux coordonnées, messagerie, favoris — 100% gratuit pour les familles.</p>
          </div>
          <Link href="/inscription?role=famille">
            <Button>Inscription gratuite</Button>
          </Link>
        </div>

        <p className="text-gray-500 text-sm mb-6">{filtered.length} au pairs trouvés</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((ap) => <AuPairCard key={ap.id} ap={ap} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun au pair trouvé avec ces critères.</p>
            <button onClick={() => { setSearch(""); setFilterCountry(""); setFilterLang(""); }} className="mt-4 text-[#E87722] font-semibold">Réinitialiser les filtres</button>
          </div>
        )}
      </div>
    </div>
  );
}
