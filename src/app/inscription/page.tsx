"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Home,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { calculateAge } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/i18n";

type Role = "au-pair" | "famille" | null;

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EXPERIENCE_OPTIONS = [
  "Moins d'1 an",
  "1 an",
  "2 ans",
  "3 ans",
  "4 ans",
  "5 ans et plus",
];

const PAGE_BACKGROUND =
  "bg-[radial-gradient(ellipse_at_top_left,rgba(232,119,34,0.18),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(58,91,168,0.14),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(63,164,91,0.12),transparent_60%),linear-gradient(180deg,#FFF8F1_0%,#F7F4FA_55%,#F1F6F3_100%)] bg-fixed";

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
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { t, tValue, tError } = useI18n();
  const s = t.signup;
  const e = s.errors;

  const steps = role === "au-pair" ? s.stepsAuPair : s.stepsFamily;

  const requiredErrors = (() => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      const firstName = form.firstName.trim();
      const lastName = form.lastName.trim();
      const email = form.email.trim();
      if (!firstName) errs.firstName = e.firstName;
      else if (firstName.length < 2) errs.firstName = e.firstNameTooShort;
      if (!lastName) errs.lastName = e.lastName;
      else if (lastName.length < 2) errs.lastName = e.lastNameTooShort;
      if (!email) errs.email = e.email;
      else if (!EMAIL_REGEX.test(email)) errs.email = e.emailInvalid;
      if (!form.password) errs.password = e.password;
      else if (form.password.length < PASSWORD_MIN_LENGTH)
        errs.password = e.passwordTooShort;
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
    return touched || blurred[field] ? err : null;
  };

  const markBlurred = (field: string) =>
    setBlurred((b) => (b[field] ? b : { ...b, [field]: true }));

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
      fieldError(field)
        ? "border-red-300 focus:ring-red-400"
        : "border-gray-200 focus:ring-[#E87722]"
    }`;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          country: form.country,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          languages: form.languages,
          educationLevel: form.educationLevel.trim(),
          experience: form.experience.trim(),
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
        email: form.email.trim(),
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
      <div className={`min-h-dvh flex items-center justify-center p-8 ${PAGE_BACKGROUND}`}>
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
    <div className={`min-h-dvh py-12 px-4 ${PAGE_BACKGROUND}`}>
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={56}
            height={56}
            className="w-12 h-12 rounded-full object-cover"
            priority
          />
          <span className="font-bold text-xl text-[#1A1A2E]">
            AuPair<span className="text-[#E87722]">A.EU</span>
          </span>
        </Link>

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
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.firstName}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    onBlur={() => markBlurred("firstName")}
                    aria-invalid={!!fieldError("firstName")}
                    className={inputClass("firstName")}
                    placeholder="Marie"
                  />
                  {fieldError("firstName") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("firstName")}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.lastName}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    onBlur={() => markBlurred("lastName")}
                    aria-invalid={!!fieldError("lastName")}
                    className={inputClass("lastName")}
                    placeholder="Dupont"
                  />
                  {fieldError("lastName") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("lastName")}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    onBlur={() => markBlurred("email")}
                    aria-invalid={!!fieldError("email")}
                    className={inputClass("email")}
                    placeholder={s.emailPlaceholder}
                  />
                  {fieldError("email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("email")}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.password}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      onBlur={() => markBlurred("password")}
                      aria-invalid={!!fieldError("password")}
                      aria-describedby="password-hint"
                      className={`${inputClass("password")} pr-11`}
                      placeholder={s.passwordPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldError("password") ? (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("password")}
                    </p>
                  ) : (
                    <p
                      id="password-hint"
                      className={`flex items-center gap-1 text-xs mt-1 ${
                        form.password.length >= PASSWORD_MIN_LENGTH
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {form.password.length >= PASSWORD_MIN_LENGTH && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {s.passwordHint(
                        Math.min(form.password.length, PASSWORD_MIN_LENGTH)
                      )}
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
                  <SelectField
                    value={form.country}
                    onChange={(v) => setForm({ ...form, country: v })}
                    onBlur={() => markBlurred("country")}
                    invalid={!!fieldError("country")}
                    aria-label={s.countryOfOrigin}
                    placeholder={s.selectYourCountry}
                    options={originCountries.map((c) => ({
                      value: c.name,
                      label: tValue(c.name),
                    }))}
                  />
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
                  <SelectField
                    value={form.gender}
                    onChange={(v) => setForm({ ...form, gender: v })}
                    onBlur={() => markBlurred("gender")}
                    invalid={!!fieldError("gender")}
                    aria-label={s.gender}
                    placeholder={s.select}
                    options={["Femme", "Homme"].map((v) => ({
                      value: v,
                      label: tValue(v),
                    }))}
                  />
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
                    onBlur={() => markBlurred("dateOfBirth")}
                    className={inputClass("dateOfBirth")}
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
                  <SelectField
                    value={form.educationLevel}
                    onChange={(v) => setForm({ ...form, educationLevel: v })}
                    aria-label={s.educationLevel}
                    placeholder={s.select}
                    options={EDUCATION_LEVELS.filter((level) => level !== "Autre").map((level) => ({
                      value: level,
                      label: tValue(level),
                    }))}
                    allowCustom
                    otherLabel={s.otherOption}
                    customPlaceholder={s.educationCustomPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {s.experience}
                  </label>
                  <SelectField
                    value={form.experience}
                    onChange={(v) => setForm({ ...form, experience: v })}
                    aria-label={s.experience}
                    placeholder={s.select}
                    options={EXPERIENCE_OPTIONS.map((v) => ({
                      value: v,
                      label: tValue(v),
                    }))}
                    allowCustom
                    otherLabel={s.otherOption}
                    customPlaceholder={s.experienceCustomPlaceholder}
                  />
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
                  <SelectField
                    value={form.hostCountry}
                    onChange={(v) => setForm({ ...form, hostCountry: v })}
                    onBlur={() => markBlurred("hostCountry")}
                    invalid={!!fieldError("hostCountry")}
                    aria-label={s.hostCountry}
                    placeholder={s.selectCountry}
                    options={hostCountries.map((c) => ({
                      value: c.name,
                      label: tValue(c.name),
                    }))}
                  />
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
                    onBlur={() => markBlurred("city")}
                    className={inputClass("city")}
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
                  <SelectField
                    value={form.numberOfKids}
                    onChange={(v) => setForm({ ...form, numberOfKids: v })}
                    onBlur={() => markBlurred("numberOfKids")}
                    invalid={!!fieldError("numberOfKids")}
                    aria-label={s.numberOfKids}
                    placeholder={s.select}
                    options={["1", "2", "3", "4", "5+"].map((n) => ({
                      value: n,
                      label: n,
                    }))}
                  />
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
        <div className={`min-h-dvh flex items-center justify-center ${PAGE_BACKGROUND}`}>
          <div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InscriptionContent />
    </Suspense>
  );
}
