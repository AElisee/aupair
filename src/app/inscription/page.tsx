"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { calculateAge } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/i18n";

type Role = "au-pair" | "famille" | null;

function InscriptionContent() {
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as Role) || null;
  const [step, setStep] = useState(defaultRole ? 1 : 0);
  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    gender: "",
    dateOfBirth: "",
    languages: [] as string[],
    educationLevel: "",
    experience: "",
    city: "",
    numberOfKids: "",
    hostCountry: "",
  });
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { origin: originCountries, host: hostCountries } = useCountries();
  const { languages: LANGUAGES, educationLevels: EDUCATION_LEVELS } =
    useConstants();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const { t, tValue, tError } = useI18n();
  const s = t.signup;
  const e = s.errors;

  const steps = role === "au-pair" ? s.stepsAuPair : s.stepsFamily;

  const requiredErrors = (() => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName) errs.firstName = e.firstName;
      if (!form.lastName) errs.lastName = e.lastName;
      if (!form.email) errs.email = e.email;
      if (!form.password) errs.password = e.password;
    } else if (step === 2 && role === "au-pair") {
      if (!form.country) errs.country = e.country;
      if (!form.gender) errs.gender = e.gender;
      if (!form.dateOfBirth)
        errs.dateOfBirth = e.dateOfBirth;
      else if (calculateAge(form.dateOfBirth) < 18)
        errs.dateOfBirth = e.tooYoung;
      if (form.languages.length === 0)
        errs.languages = e.languages;
    } else if (step === 2 && role === "famille") {
      if (!form.hostCountry)
        errs.hostCountry = e.hostCountry;
      if (!form.city) errs.city = e.city;
      if (!form.numberOfKids)
        errs.numberOfKids = e.numberOfKids;
    }
    return errs;
  })();

  const fieldError = (field: string) => {
    const err = requiredErrors[field];
    if (!err) return null;
    if (field === "dateOfBirth" && form.dateOfBirth) return err;
    return touched ? err : null;
  };

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
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          languages: form.languages,
          educationLevel: form.educationLevel,
          experience: form.experience,
          city: form.city,
          numberOfKids: form.numberOfKids,
          hostCountry: form.hostCountry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(tError(data.error, s.genericError));
        return;
      }

      const { signIn } = await import("next-auth/react");
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSubmitError(s.autoLoginFailed);
      }

      setDone(true);
    } catch {
      setSubmitError(s.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">
            {s.doneTitle}
          </h1>
          <p className="text-gray-500 mb-6">
            {role === "au-pair" ? s.doneAuPair : s.doneFamily}
          </p>
          <Link
            href={role === "au-pair" ? "/trouver-famille" : "/trouver-au-pair"}
          >
            <Button size="lg">
              {role === "au-pair" ? s.browseFamilies : s.browseAuPairs}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1A1A2E]">
            AuPair<span className="text-[#E87722]">A.EU</span>
          </span>
        </div>

        {/* Stepper */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    i < step
                      ? "bg-[#E87722] text-white"
                      : i === step
                        ? "bg-[#E87722] text-white ring-4 ring-[#E87722]/20"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 mx-1 transition-all ${i < step ? "bg-[#E87722]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Étape 0 : Choix du rôle */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">
                {s.createAccount}
              </h1>
              <p className="text-gray-500 mb-8">{s.youAre}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRole("au-pair");
                    setStep(1);
                  }}
                  className="border-2 border-gray-200 hover:border-[#E87722] rounded-2xl p-6 text-left transition-all group"
                >
                  <User className="w-8 h-8 text-[#E87722] mb-3" />
                  <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">
                    {s.auPair}
                  </h3>
                  <p className="text-gray-500 text-sm">{s.auPairDesc}</p>
                  <p className="text-[#E87722] text-xs font-semibold mt-2">{s.auPairPrice}</p>
                </button>
                <button
                  onClick={() => {
                    setRole("famille");
                    setStep(1);
                  }}
                  className="border-2 border-gray-200 hover:border-[#1A1A2E] rounded-2xl p-6 text-left transition-all"
                >
                  <Home className="w-8 h-8 text-[#1A1A2E] mb-3" />
                  <h3 className="font-bold text-[#1A1A2E] text-lg mb-1">
                    {s.family}
                  </h3>
                  <p className="text-gray-500 text-sm">{s.familyDesc}</p>
                  <p className="text-green-600 text-xs font-semibold mt-2">{s.freeSignup}</p>
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                {s.alreadyRegistered}{" "}
                <Link
                  href="/connexion"
                  className="text-[#E87722] font-semibold"
                >
                  {s.login}
                </Link>
              </p>
            </div>
          )}

          {/* Étape 1 : Infos de base */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">
                {s.basicInfo}
              </h2>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {s.firstName}
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                      placeholder="Marie"
                    />
                    {fieldError("firstName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldError("firstName")}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {s.lastName}
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                      placeholder="Dupont"
                    />
                    {fieldError("lastName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldError("lastName")}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.email}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder={s.emailPlaceholder}
                  />
                  {fieldError("email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("email")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.password}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder={s.passwordPlaceholder}
                  />
                  {fieldError("password") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("password")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Profil spécifique */}
          {step === 2 && role === "au-pair" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">
                {s.auPairProfile}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.countryOfOrigin}
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.selectYourCountry}</option>
                    {originCountries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {tValue(c.name)}
                      </option>
                    ))}
                  </select>
                  {fieldError("country") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("country")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.gender}
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.select}</option>
                    <option value="Femme">{tValue("Femme")}</option>
                    <option value="Homme">{tValue("Homme")}</option>
                  </select>
                  {fieldError("gender") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("gender")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.dateOfBirth}
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  />
                  {fieldError("dateOfBirth") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("dateOfBirth")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {s.languages}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <label
                        key={lang}
                        className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer text-sm transition-all ${
                          form.languages.includes(lang)
                            ? "border-[#E87722] bg-[#FFF3E0] text-[#E87722] font-semibold"
                            : "border-gray-200 text-gray-700 hover:border-[#E87722]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.languages.includes(lang)}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              languages: e.target.checked
                                ? [...form.languages, lang]
                                : form.languages.filter((l) => l !== lang),
                            })
                          }
                        />
                        {tValue(lang)}
                      </label>
                    ))}
                  </div>
                  {fieldError("languages") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("languages")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.educationLevel}
                  </label>
                  <select
                    value={form.educationLevel}
                    onChange={(e) =>
                      setForm({ ...form, educationLevel: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.select}</option>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {tValue(level)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.experience}
                  </label>
                  <select
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.select}</option>
                    {[
                      "Moins d'1 an",
                      "1 an",
                      "2 ans",
                      "3 ans",
                      "4 ans",
                      "5 ans et plus",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {tValue(v)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && role === "famille" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">
                {s.familyProfile}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.hostCountry}
                  </label>
                  <select
                    value={form.hostCountry}
                    onChange={(e) =>
                      setForm({ ...form, hostCountry: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.selectCountry}</option>
                    {hostCountries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {tValue(c.name)}
                      </option>
                    ))}
                  </select>
                  {fieldError("hostCountry") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("hostCountry")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.city}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    placeholder="Paris, Lyon, Berlin..."
                  />
                  {fieldError("city") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("city")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.numberOfKids}
                  </label>
                  <select
                    value={form.numberOfKids}
                    onChange={(e) =>
                      setForm({ ...form, numberOfKids: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] bg-white"
                  >
                    <option value="">{s.select}</option>
                    {["1", "2", "3", "4", "5+"].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {fieldError("numberOfKids") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("numberOfKids")}
                    </p>
                  )}
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
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-2">
                {s.readyTitle}
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                {role === "au-pair" ? s.readyAuPair : s.readyFamily}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-gray-600">{s.summaryName}</span>{" "}
                  {form.firstName} {form.lastName}
                </p>
                <p>
                  <span className="font-semibold text-gray-600">{s.summaryEmail}</span>{" "}
                  {form.email}
                </p>
                <p>
                  <span className="font-semibold text-gray-600">{s.summaryRole}</span>{" "}
                  {role === "au-pair" ? s.auPair : s.family}
                </p>
              </div>
              {submitError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <p className="text-xs text-gray-400 mb-4">
                {s.termsStart}{" "}
                <Link href="/cgu" className="text-[#E87722] underline">
                  {s.terms}
                </Link>{" "}
                {s.termsAnd}{" "}
                <Link
                  href="/confidentialite"
                  className="text-[#E87722] underline"
                >
                  {s.privacy}
                </Link>
                .
              </p>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setTouched(false);
                  setStep(step - 1);
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A2E] text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> {s.back}
              </button>
              {step < 3 ? (
                <Button
                  onClick={() => {
                    if (Object.keys(requiredErrors).length > 0) {
                      setTouched(true);
                      return;
                    }
                    setTouched(false);
                    setStep(step + 1);
                  }}
                >
                  {s.continue} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? s.creating : s.createMyAccount}{" "}
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
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InscriptionContent />
    </Suspense>
  );
}
