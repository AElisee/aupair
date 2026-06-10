"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, CheckCircle, ArrowRight, ArrowLeft, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EDUCATION_LEVELS, LANGUAGES } from "@/lib/constants";
import { useCountries } from "@/hooks/useCountries";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Role = "au-pair" | "famille" | null;

function InscriptionContent() {
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as Role) || null;
  const [step, setStep] = useState(defaultRole ? 1 : 0);
  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    country: "", languages: [] as string[],
    educationLevel: "", experience: "",
    city: "", numberOfKids: "",
  });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { origin: originCountries } = useCountries();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = role === "au-pair"
    ? ["Mon rôle", "Infos personnelles", "Mon profil", "Confirmation"]
    : ["Mon rôle", "Infos famille", "Mes besoins", "Confirmation"];

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          country: form.country,
          languages: form.languages,
          educationLevel: form.educationLevel,
          experience: form.experience,
          city: form.city,
          numberOfKids: form.numberOfKids,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error ?? "Une erreur est survenue.");
        return;
      }

      const { signIn } = await import("next-auth/react");
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSubmitError("Compte créé, mais connexion automatique échouée. Connectez-vous via la page de connexion.");
      }

      setDone(true);
    } catch {
      setSubmitError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">Inscription réussie !</h1>
          <p className="text-gray-500 mb-6">
            {role === "au-pair"
              ? "Votre profil est en cours de vérification. Vous recevrez un email dans les 24-48h."
              : "Votre profil famille est créé. Vous pouvez dès maintenant parcourir les au pairs !"}
          </p>
          <Link href="/connexion">
            <Button size="lg">Accéder à mon espace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A2E]">AuPair<span className="text-[#E87722]">A.EU</span></span>
        </div>

        {/* Stepper */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i < step ? "bg-[#E87722] text-white" : i === step ? "bg-[#E87722] text-white ring-4 ring-[#E87722]/20" : "bg-gray-200 text-gray-500"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-8 sm:w-16 mx-1 transition-all ${i < step ? "bg-[#E87722]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Étape 0 : Choix du rôle */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">Créer un compte</h1>
              <p className="text-gray-500 mb-8">Vous êtes...</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => { setRole("au-pair"); setStep(1); }}
                  className="border-2 border-gray-200 hover:border-[#E87722] rounded-2xl p-6 text-left transition-all group">
                  <User className="w-8 h-8 text-[#E87722] mb-3" />
                  <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">Au pair</h3>
                  <p className="text-gray-500 text-sm">Je cherche une famille d'accueil en Europe</p>
                  <p className="text-[#E87722] text-xs font-semibold mt-2">32€ / 30 jours</p>
                </button>
                <button onClick={() => { setRole("famille"); setStep(1); }}
                  className="border-2 border-gray-200 hover:border-[#1A1A2E] rounded-2xl p-6 text-left transition-all">
                  <Home className="w-8 h-8 text-[#1A1A2E] mb-3" />
                  <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">Famille d'accueil</h3>
                  <p className="text-gray-500 text-sm">Je cherche un au pair africain qualifié</p>
                  <p className="text-green-600 text-xs font-semibold mt-2">Inscription gratuite</p>
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                Déjà inscrit ? <Link href="/connexion" className="text-[#E87722] font-semibold">Se connecter</Link>
              </p>
            </div>
          )}

          {/* Étape 1 : Infos de base */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">Informations de base</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom *</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                      placeholder="Marie" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                      placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder="Minimum 8 caractères" />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Profil spécifique */}
          {step === 2 && role === "au-pair" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">Votre profil au pair</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Pays d'origine *</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                    <option value="">Sélectionner votre pays</option>
                    {originCountries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Langues parlées *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map(lang => (
                      <label key={lang} className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all ${
                        form.languages.includes(lang)
                          ? "border-[#E87722] bg-[#FFF3E0] text-[#E87722] font-semibold"
                          : "border-gray-200 text-gray-700 hover:border-[#E87722]"
                      }`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.languages.includes(lang)}
                          onChange={e => setForm({
                            ...form,
                            languages: e.target.checked
                              ? [...form.languages, lang]
                              : form.languages.filter(l => l !== lang),
                          })}
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Niveau d'études</label>
                  <select value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                    <option value="">Sélectionner</option>
                    {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Années d'expérience avec les enfants</label>
                  <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                    <option value="">Sélectionner</option>
                    {["Moins d'1 an", "1 an", "2 ans", "3 ans", "4 ans", "5 ans et plus"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && role === "famille" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">Votre profil famille</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ville *</label>
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder="Paris, Lyon, Berlin..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre d'enfants *</label>
                  <select value={form.numberOfKids} onChange={e => setForm({ ...form, numberOfKids: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white">
                    <option value="">Sélectionner</option>
                    {["1", "2", "3", "4", "5+"].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#E87722]" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-2">Tout est prêt !</h2>
              <p className="text-gray-500 mb-6 text-sm">
                {role === "au-pair"
                  ? "En cliquant sur 'Créer mon compte', votre profil sera soumis à vérification. Vous recevrez un email de confirmation."
                  : "En cliquant sur 'Créer mon compte', votre profil famille sera immédiatement actif."}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
                <p><span className="font-semibold text-gray-600">Nom :</span> {form.firstName} {form.lastName}</p>
                <p><span className="font-semibold text-gray-600">Email :</span> {form.email}</p>
                <p><span className="font-semibold text-gray-600">Rôle :</span> {role === "au-pair" ? "Au pair" : "Famille d'accueil"}</p>
              </div>
              {submitError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <p className="text-xs text-gray-400 mb-4">
                En créant un compte, vous acceptez nos{" "}
                <Link href="/cgu" className="text-[#E87722] underline">CGU</Link> et notre{" "}
                <Link href="/confidentialite" className="text-[#E87722] underline">politique de confidentialité</Link>.
              </p>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A2E] text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Continuer <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Création en cours..." : "Créer mon compte"}{" "}
                  {!submitting && <CheckCircle className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" /></div>}>
      <InscriptionContent />
    </Suspense>
  );
}
