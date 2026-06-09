"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Search, MessageCircle, Bell, CreditCard, Settings, Home, Camera, CheckCircle } from "lucide-react";
import { COUNTRIES_ORIGIN, EDUCATION_LEVELS } from "@/lib/constants";

const navItems = [
  { href: "/dashboard/au-pair", icon: Home, label: "Tableau de bord" },
  { href: "/dashboard/au-pair/profil", icon: User, label: "Mon profil" },
  { href: "/dashboard/au-pair/recherche", icon: Search, label: "Rechercher une famille" },
  { href: "/dashboard/au-pair/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/au-pair/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/au-pair/abonnement", icon: CreditCard, label: "Mon abonnement" },
  { href: "/dashboard/au-pair/parametres", icon: Settings, label: "Paramètres" },
];

export default function AuPairProfilPage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Aminata", lastName: "Koné", dateOfBirth: "2002-05-15",
    gender: "F", nationality: "Camerounaise", countryOfOrigin: "Cameroun",
    cityOfOrigin: "Yaoundé", languages: ["Français", "Anglais"],
    educationLevel: "Licence / Bachelor", childcareYears: "3",
    targetCountries: ["France", "Belgique"], preferredDuration: "1 an",
    isSmoker: false, description: "Passionnée par les enfants, je cherche une famille accueillante pour une expérience inoubliable.",
    motivation: "Je souhaite devenir au pair pour découvrir la culture européenne tout en m'occupant d'enfants.",
    phoneWhatsapp1: "+237 6XX XXX XXX",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout navItems={navItems} role="au-pair" userName="Aminata K.">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1A1A2E]">Mon profil</h1>
            <p className="text-gray-500">Votre profil est visible après validation par notre équipe.</p>
          </div>
          <Badge variant="warning">En attente de validation</Badge>
        </div>

        {/* Photo de profil */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-4">Photo de profil</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[#E87722] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.firstName.charAt(0)}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A2E] rounded-full flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="font-medium text-[#1A1A2E] text-sm mb-1">Ajouter une photo professionnelle</p>
              <p className="text-xs text-gray-400 mb-2">JPG ou PNG, max 5 Mo. Une bonne photo augmente vos chances de contact.</p>
              <Button size="sm" variant="outline">Télécharger une photo</Button>
            </div>
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Informations personnelles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
              <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
              <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance</label>
              <input type="date" value={profile.dateOfBirth} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pays d'origine</label>
              <select value={profile.countryOfOrigin} onChange={e => setProfile({ ...profile, countryOfOrigin: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                {COUNTRIES_ORIGIN.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau d'études</label>
              <select value={profile.educationLevel} onChange={e => setProfile({ ...profile, educationLevel: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                {EDUCATION_LEVELS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expérience (années)</label>
              <select value={profile.childcareYears} onChange={e => setProfile({ ...profile, childcareYears: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                {["0", "1", "2", "3", "4", "5+"].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Description & Motivation */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Description & Motivation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Présentation personnelle</label>
              <textarea value={profile.description} onChange={e => setProfile({ ...profile, description: e.target.value })}
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pourquoi souhaitez-vous devenir au pair ?</label>
              <textarea value={profile.motivation} onChange={e => setProfile({ ...profile, motivation: e.target.value })}
                rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-[#1A1A2E] mb-5">Contact WhatsApp</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro WhatsApp principal</label>
            <input type="tel" value={profile.phoneWhatsapp1} onChange={e => setProfile({ ...profile, phoneWhatsapp1: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
              placeholder="+237 6XX XXX XXX" />
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <div className="flex items-center gap-4">
          <Button size="lg" onClick={handleSave}>Sauvegarder les modifications</Button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Profil sauvegardé !
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
