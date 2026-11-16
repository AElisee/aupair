"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CheckCircle, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  appendProfileFields,
  AuPairProfileFields,
  EMPTY_PROFILE_FORM,
  FamilyProfileFields,
  fieldInputClass,
  getProfileFieldErrors,
  SIGNUP_PAGE_BACKGROUND,
  type ProfileForm,
  type SignupRole,
} from "@/components/auth/SignupProfileFields";
import { NAME_MIN_LENGTH } from "@/lib/signup-rules";
import { getDefaultRedirectForRole } from "@/lib/safe-redirect";
import { useI18n } from "@/i18n";

type Prefill = {
  needsOnboarding: boolean;
  email?: string;
  role?: SignupRole | null;
  firstName?: string;
  lastName?: string;
  country?: string;
  gender?: string;
  languages?: string[];
  hostCountry?: string;
  city?: string;
  numberOfKids?: string;
  hasIdDocument?: boolean;
};

/**
 * Finalisation obligatoire d'un compte créé via Google/Facebook (ou d'un ancien profil incomplet) :
 * mêmes champs obligatoires que le formulaire `/inscription`. proxy.ts y renvoie l'utilisateur tant
 * que ce n'est pas fait (`token.onboarding`).
 */
export default function CompleteSignupPage() {
  const { t, tError } = useI18n();
  const s = t.signup;
  const c = t.completeSignup;
  const router = useRouter();
  const { update } = useSession();

  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SignupRole | null>(null);
  const [names, setNames] = useState({ firstName: "", lastName: "" });
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE_FORM);
  const [hasIdDocument, setHasIdDocument] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Session rafraîchie (le proxy relit `onboarding` dans le cookie) puis redirection vers l'espace. */
  const goToSpace = async () => {
    const session = await update();
    router.replace(getDefaultRedirectForRole(session?.user?.role));
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/complete-profile")
      .then((res) => (res.ok ? (res.json() as Promise<Prefill>) : null))
      .then(async (data) => {
        if (cancelled) return;
        if (!data) return setLoadState("error");
        if (!data.needsOnboarding) return goToSpace();
        setEmail(data.email ?? "");
        setRole(data.role ?? null);
        setNames({ firstName: data.firstName ?? "", lastName: data.lastName ?? "" });
        setForm({
          ...EMPTY_PROFILE_FORM,
          country: data.country ?? "",
          gender: data.gender ?? "",
          languages: data.languages ?? [],
          hostCountry: data.hostCountry ?? "",
          city: data.city ?? "",
          numberOfKids: data.numberOfKids ?? "",
        });
        setHasIdDocument(!!data.hasIdDocument);
        setLoadState("ready");
      })
      .catch(() => !cancelled && setLoadState("error"));
    return () => {
      cancelled = true;
    };
    // Chargement unique à l'ouverture de la page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const withIdDocument = role === "famille" && !hasIdDocument;
  const e = s.errors;
  const errors: Record<string, string> = {};
  const firstName = names.firstName.trim();
  const lastName = names.lastName.trim();
  if (!firstName) errors.firstName = e.firstName;
  else if (firstName.length < NAME_MIN_LENGTH) errors.firstName = e.firstNameTooShort;
  if (!lastName) errors.lastName = e.lastName;
  else if (lastName.length < NAME_MIN_LENGTH) errors.lastName = e.lastNameTooShort;
  if (!role) errors.role = c.roleRequired;
  else Object.assign(errors, getProfileFieldErrors(role, form, { idDocument, withIdDocument }, { t, tError }));

  const fieldError = (field: string) => {
    const err = errors[field];
    if (!err) return null;
    if (field === "dateOfBirth" && form.dateOfBirth) return err;
    if (field === "idDocument" && idDocument) return err;
    return touched || blurred[field] ? err : null;
  };
  const markBlurred = (field: string) => setBlurred((b) => (b[field] ? b : { ...b, [field]: true }));
  const fieldsProps = {
    form,
    onChange: (patch: Partial<ProfileForm>) => setForm((f) => ({ ...f, ...patch })),
    fieldError,
    markBlurred,
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0 || !role) {
      setTouched(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = new FormData();
      body.append("firstName", firstName);
      body.append("lastName", lastName);
      appendProfileFields(body, role, form);
      if (withIdDocument && idDocument) body.append("idDocument", idDocument);

      const res = await fetch("/api/auth/complete-profile", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(tError(data.error, s.genericError));
        return;
      }
      // Nouveau profil : en attente de validation (l'espace affiche l'écran d'attente)
      await goToSpace();
    } catch {
      setSubmitError(s.networkError);
    } finally {
      setSubmitting(false);
    }
  };

  const roleCards: { value: SignupRole; icon: typeof User; title: string; desc: string }[] = [
    { value: "au-pair", icon: User, title: s.auPair, desc: s.auPairDesc },
    { value: "famille", icon: Home, title: s.family, desc: s.familyDesc },
  ];

  return (
    <div className={`min-h-dvh py-12 px-4 ${SIGNUP_PAGE_BACKGROUND}`}>
      <div className="max-w-xl mx-auto">
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

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {loadState === "loading" && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#E87722] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {loadState === "error" && <p className="text-center text-sm text-red-600 py-8">{c.loadError}</p>}

          {loadState === "ready" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-extrabold text-[#1A1A2E] mb-2">{c.title}</h1>
                <p className="text-gray-500 text-sm">{c.intro}</p>
                {email && <p className="text-xs text-gray-400 mt-2">{c.signedInAs(email)}</p>}
              </div>

              <section>
                <p className="block text-sm font-semibold text-gray-700 mb-2">{c.roleTitle}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {roleCards.map(({ value, icon: Icon, title, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      aria-pressed={role === value}
                      className={`border-2 rounded-2xl p-4 text-left transition-all ${
                        role === value ? "border-[#E87722] bg-[#FFF3E0]" : "border-gray-200 hover:border-[#E87722]"
                      }`}
                    >
                      <Icon className="w-6 h-6 text-[#E87722] mb-2" />
                      <span className="block font-bold text-[#1A1A2E]">{title}</span>
                      <span className="block text-gray-500 text-xs mt-1">{desc}</span>
                    </button>
                  ))}
                </div>
                {fieldError("role") && <p className="text-xs text-red-500 mt-1">{fieldError("role")}</p>}
              </section>

              <section>
                <h2 className="text-lg font-extrabold text-[#1A1A2E] mb-4">{c.identityTitle}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(["firstName", "lastName"] as const).map((field) => (
                    <div key={field}>
                      <label htmlFor={field} className="block text-sm font-semibold text-gray-700 mb-1">
                        {s[field]}
                      </label>
                      <input
                        id={field}
                        type="text"
                        autoComplete={field === "firstName" ? "given-name" : "family-name"}
                        value={names[field]}
                        onChange={(ev) => setNames((n) => ({ ...n, [field]: ev.target.value }))}
                        onBlur={() => markBlurred(field)}
                        aria-invalid={!!fieldError(field)}
                        className={fieldInputClass(!!fieldError(field))}
                      />
                      {fieldError(field) && <p className="text-xs text-red-500 mt-1">{fieldError(field)}</p>}
                    </div>
                  ))}
                </div>
              </section>

              {role && (
                <section>
                  <h2 className="text-lg font-extrabold text-[#1A1A2E] mb-4">
                    {role === "au-pair" ? s.auPairProfile : s.familyProfile}
                  </h2>
                  {role === "au-pair" ? (
                    <AuPairProfileFields {...fieldsProps} />
                  ) : (
                    <FamilyProfileFields
                      {...fieldsProps}
                      idDocument={idDocument}
                      setIdDocument={setIdDocument}
                      withIdDocument={withIdDocument}
                    />
                  )}
                </section>
              )}

              <div className="pt-6 border-t border-gray-100 space-y-4">
                {submitError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {submitError}
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  {c.termsStart}{" "}
                  <Link href="/cgu" className="text-[#E87722] underline">
                    {s.terms}
                  </Link>{" "}
                  {s.termsAnd}{" "}
                  <Link href="/confidentialite" className="text-[#E87722] underline">
                    {s.privacy}
                  </Link>
                  .
                </p>
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/connexion" })}
                    className="text-sm text-gray-500 hover:text-[#1A1A2E] font-medium"
                  >
                    {c.signOut}
                  </button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? c.submitting : c.submit} {!submitting && <CheckCircle className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
