"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Users, Clock, Lock } from "lucide-react";
import { COUNTRIES_HOST } from "@/lib/constants";

const mockFamilies = [
  { id: "1", name: "Famille Dumont", city: "Lyon", country: "France", flag: "🇫🇷", kids: 2, kidsAges: [4, 7], tasks: "Garde enfants, aide devoirs, activités sportives", hoursPerWeek: 30, pocketMoney: 350, languages: ["Français"], description: "Famille chaleureuse cherche au pair pour nos deux enfants. Logement indépendant fourni.", isActive: true },
  { id: "2", name: "Familie Schmidt", city: "Berlin", country: "Allemagne", flag: "🇩🇪", kids: 1, kidsAges: [3], tasks: "Garde enfant, sorties, activités créatives", hoursPerWeek: 25, pocketMoney: 380, languages: ["Allemand", "Anglais"], description: "Jeune couple cherche au pair anglophone ou francophone pour notre fils de 3 ans.", isActive: true },
  { id: "3", name: "Famille Leblanc", city: "Paris", country: "France", flag: "🇫🇷", kids: 3, kidsAges: [2, 5, 9], tasks: "Garde enfants, école, aide devoirs", hoursPerWeek: 35, pocketMoney: 400, languages: ["Français"], description: "Grande famille parisienne cherche au pair expérimenté(e) pour 3 enfants adorables.", isActive: true },
  { id: "4", name: "Famille Müller", city: "Zurich", country: "Suisse", flag: "🇨🇭", kids: 2, kidsAges: [6, 8], tasks: "Récupération école, activités, aide devoirs", hoursPerWeek: 20, pocketMoney: 500, languages: ["Français", "Allemand"], description: "Famille aisée à Zurich, logement spacieux, argent de poche attractif.", isActive: false },
  { id: "5", name: "Famille Dupont", city: "Bruxelles", country: "Belgique", flag: "🇧🇪", kids: 2, kidsAges: [1, 4], tasks: "Garde nourrisson, activités, ménage léger", hoursPerWeek: 30, pocketMoney: 330, languages: ["Français"], description: "Parents actifs cherchent au pair de confiance pour nos deux petits.", isActive: true },
  { id: "6", name: "Family Johnson", city: "New York", country: "États-Unis", flag: "🇺🇸", kids: 1, kidsAges: [5], tasks: "Garde enfant, activités, aide devoirs", hoursPerWeek: 40, pocketMoney: 600, languages: ["Anglais"], description: "Family in NYC looking for a French-speaking au pair for our daughter.", isActive: true },
];

function FamilyCard({ fam }: { fam: typeof mockFamilies[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className="relative h-36 bg-gradient-to-br from-[#1A1A2E] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-1">{fam.flag}</div>
          <p className="text-white font-bold">{fam.city}</p>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={fam.isActive ? "success" : "warning"}>
            {fam.isActive ? "Active" : "En pause"}
          </Badge>
        </div>
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
            <span>{fam.kids} enfant{fam.kids > 1 ? "s" : ""} ({fam.kidsAges.join(", ")} ans)</span>
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
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockFamilies.filter((f) => {
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
            {mockFamilies.length} familles disponibles · Abonnement 32€/30 jours pour contacter les familles
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
                {COUNTRIES_HOST.map((c) => <option key={c} value={c}>{c}</option>)}
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

        <p className="text-gray-500 text-sm mb-6">{filtered.length} familles trouvées</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => <FamilyCard key={f.id} fam={f} />)}
        </div>
      </div>
    </div>
  );
}
