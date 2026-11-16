"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ArrowRight, ArrowLeft, User, Home, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  appendProfileFields,
  AuPairProfileFields,
  EMPTY_PROFILE_FORM,
  SIGNUP_PAGE_BACKGROUND,
  FamilyProfileFields,
  fieldInputClass,
  getProfileFieldErrors,
  type ProfileForm,
  type SignupRole,
} from "@/components/auth/SignupProfileFields";
import { EMAIL_REGEX, NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/signup-rules";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/i18n";

type Role = SignupRole | null;

const PAGE_BACKGROUND = SIGNUP_PAGE_BACKGROUND;

function InscriptionContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const defaultRole: Role = roleParam === "au-pair" || roleParam === "famille" ? roleParam : null;
  const [step, setStep] = useState(defaultRole ? 1 : 0);
  const [role, setRole] = useState<Role>(defaultRole);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ...EMPTY_PROFILE_FORM,
  });
  // Pièce d'identité, obligatoire pour une famille
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      else if (firstName.length < NAME_MIN_LENGTH) errs.firstName = e.firstNameTooShort;
      if (!lastName) errs.lastName = e.lastName;
      else if (lastName.length < NAME_MIN_LENGTH) errs.lastName = e.lastNameTooShort;
      if (!email) errs.email = e.email;
      else if (!EMAIL_REGEX.test(email)) errs.email = e.emailInvalid;
      if (!form.password) errs.password = e.password;
      else if (form.password.length < PASSWORD_MIN_LENGTH)
        errs.password = e.passwordTooShort;
    } else if (step === 2 && role) {
      Object.assign(
        errs,
        getProfileFieldErrors(role, form, { idDocument, withIdDocument: role === "famille" }, { t, tError }),
      );
    }
    return errs;
  })();

  const fieldError = (field: string) => {
    const err = requiredErrors[field];
    if (!err) return null;
    if (field === "dateOfBirth" && form.dateOfBirth) return err;
    if (field === "idDocument" && idDocument) return err;
    return touched || blurred[field] ? err : null;
  };

  const markBlurred = (field: string) =>
    setBlurred((b) => (b[field] ? b : { ...b, [field]: true }));

  const inputClass = (field: string) => fieldInputClass(!!fieldError(field));

  const profileFieldsProps = {
    form,
    onChange: (patch: Partial<ProfileForm>) => setForm((f) => ({ ...f, ...patch })),
    fieldError,
    markBlurred,
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // multipart/form-data pour pouvoir joindre la pièce d'identité de la famille
      const body = new FormData();
      body.append("firstName", form.firstName.trim());
      body.append("lastName", form.lastName.trim());
      body.append("email", form.email.trim());
      body.append("password", form.password);
      if (role) appendProfileFields(body, role, form);
      if (role === "famille" && idDocument) body.append("idDocument", idDocument);

      const res = await fetch("/api/auth/register", { method: "POST", body });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(tError(data.error, s.genericError));
        return;
      }

      // Pas de connexion automatique : le compte doit d'abord être validé.
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
              <AuPairProfileFields {...profileFieldsProps} />
            </div>
          )}

          {step === 2 && role === "famille" && (
            <div>
              <h2 className="text-xl font-extrabold text-[#1A1A2E] mb-6">
                {s.familyProfile}
              </h2>
              <FamilyProfileFields
                {...profileFieldsProps}
                idDocument={idDocument}
                setIdDocument={setIdDocument}
                withIdDocument
              />
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
                {role === "famille" && (
                  <>
                    <p>
                      <span className="font-semibold text-gray-600">{s.summaryHostCountry}</span>{" "}
                      {tValue(form.hostCountry)}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">{s.summaryCity}</span>{" "}
                      {form.city}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-600">{s.summaryNumberOfKids}</span>{" "}
                      {form.numberOfKids}
                    </p>
                  </>
                )}
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
