"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ArrowRight, ArrowLeft, User, Home, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequiredMark } from "@/components/ui/required-mark";
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
import { SignupDoneScreen } from "@/components/auth/SignupDoneScreen";
import { EMAIL_REGEX, NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/signup-rules";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/i18n";

type Role = SignupRole | null;

const PAGE_BACKGROUND = SIGNUP_PAGE_BACKGROUND;

/** Cartes de choix du rôle : orange pour l'au pair, bleu pour la famille. */
const ROLE_CARDS = [
  {
    role: "au-pair",
    icon: User,
    card: "border-[#E87722]/25 bg-gradient-to-br from-[#FFE8D1] via-[#FFF5EA] to-white hover:border-[#E87722] hover:shadow-[#E87722]/15 focus-visible:ring-[#E87722]",
    chip: "bg-gradient-to-br from-[#F59A4F] to-[#E87722] shadow-[#E87722]/25",
    arrow: "text-[#E87722]",
    badge: "bg-[#E87722]/15 text-[#9A4A0C]",
  },
  {
    role: "famille",
    icon: Home,
    card: "border-[#3A5BA8]/25 bg-gradient-to-br from-[#DDE6F8] via-[#F1F5FC] to-white hover:border-[#3A5BA8] hover:shadow-[#3A5BA8]/15 focus-visible:ring-[#3A5BA8]",
    chip: "bg-gradient-to-br from-[#5F7FCB] to-[#3A5BA8] shadow-[#3A5BA8]/25",
    arrow: "text-[#3A5BA8]",
    badge: "bg-[#3FA45B]/15 text-[#256B3A]",
  },
] as const;

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
  // Pièce d'identité, obligatoire (au pair et famille)
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { t, tValue, tError, locale } = useI18n();
  const s = t.signup;
  const e = s.errors;

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
        getProfileFieldErrors(role, form, { idDocument, withIdDocument: true }, { t, tError }),
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
    idDocument,
    setIdDocument,
    withIdDocument: true,
  };

  // Récapitulatif (étape 3) : tout ce qui a été renseigné, sauf le mot de passe
  const summary: [string, string][] = (
    [
      [s.summaryRole, role === "au-pair" ? s.auPair : s.family],
      [s.firstName, form.firstName.trim()],
      [s.lastName, form.lastName.trim()],
      [s.email, form.email.trim()],
      ...(role === "au-pair"
        ? [
            [s.countryOfOrigin, tValue(form.country)],
            [s.gender, tValue(form.gender)],
            [
              s.dateOfBirth,
              form.dateOfBirth &&
                new Date(form.dateOfBirth).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }),
            ],
            [s.languages, form.languages.map((l) => tValue(l)).join(", ")],
            [s.educationLevel, tValue(form.educationLevel.trim())],
            [s.experience, tValue(form.experience.trim())],
          ]
        : [
            [s.hostCountry, tValue(form.hostCountry)],
            [s.city, form.city.trim()],
            [s.numberOfKids, form.numberOfKids.trim()],
          ]),
      [s.idDocument, idDocument?.name ?? ""],
    ] as [string, string][]
  ).filter(([, value]) => value);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // multipart/form-data pour pouvoir joindre la pièce d'identité
      const body = new FormData();
      body.append("firstName", form.firstName.trim());
      body.append("lastName", form.lastName.trim());
      body.append("email", form.email.trim());
      body.append("password", form.password);
      if (role) appendProfileFields(body, role, form);
      if (idDocument) body.append("idDocument", idDocument);

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

  if (done && role) return <SignupDoneScreen role={role} />;

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

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-8">
          {/* Étape 0 : Choix du rôle */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-medium text-[#1A1A2E] mb-2">
                {s.createAccount}
              </h1>
              <p className="text-sm text-gray-500 mb-6">{s.youAre}</p>
              <div className="grid gap-3">
                {ROLE_CARDS.map(({ role: cardRole, icon: Icon, ...style }) => {
                  const isAuPair = cardRole === "au-pair";
                  return (
                    <button
                      key={cardRole}
                      type="button"
                      onClick={() => {
                        setRole(cardRole);
                        setStep(1);
                      }}
                      className={`group w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${style.card}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${style.chip}`}
                        >
                          <Icon size={20} strokeWidth={1.25} aria-hidden="true" />
                        </span>
                        <span className="flex-1 text-base font-semibold text-[#1A1A2E]">
                          {isAuPair ? s.auPair : s.family}
                        </span>
                        <ArrowRight
                          size={20}
                          strokeWidth={1.25}
                          aria-hidden="true"
                          className={`shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none ${style.arrow}`}
                        />
                      </span>
                      <span className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                        <span className="text-sm text-gray-600">
                          {isAuPair ? s.auPairDesc : s.familyDesc}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                        >
                          {isAuPair ? s.auPairPrice : s.freeSignup}
                        </span>
                      </span>
                    </button>
                  );
                })}
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
                    {s.firstName} <RequiredMark />
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
                    aria-required
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
                    {s.lastName} <RequiredMark />
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
                    aria-required
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
                    {s.email} <RequiredMark />
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
                    aria-required
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
                    {s.password} <RequiredMark />
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
                      aria-required
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
              <FamilyProfileFields {...profileFieldsProps} />
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div className="text-center">
              <div className="-mx-5 -mt-5 sm:-mx-8 sm:-mt-8 mb-5 px-5 py-4 flex items-center justify-center gap-3 rounded-t-2xl border-b border-[#E87722]/25 bg-[#FFF3E0]">
                <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#E87722]" aria-hidden="true" />
                </span>
                <h2 className="text-xl font-extrabold text-[#1A1A2E]">{s.readyTitle}</h2>
              </div>
              <p className="text-gray-500 mb-6 text-sm">
                {role === "au-pair" ? s.readyAuPair : s.readyFamily}
              </p>
              <dl className="bg-gray-50 rounded-xl px-4 py-1 text-left mb-6 text-sm divide-y divide-gray-200/70">
                {summary.map(([label, value]) => (
                  <div key={label} className="py-2.5 sm:flex sm:gap-4">
                    <dt className="text-gray-500 sm:w-2/5 sm:shrink-0">{label}</dt>
                    <dd className="font-medium text-[#1A1A2E] break-words min-w-0">{value}</dd>
                  </div>
                ))}
              </dl>
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
