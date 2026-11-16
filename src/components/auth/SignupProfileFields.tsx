"use client";

import { FileText, Upload, X } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { DateField } from "@/components/ui/date-field";
import { useCountries } from "@/hooks/useCountries";
import { useConstants } from "@/hooks/useConstants";
import { calculateAge } from "@/lib/utils";
import { MAX_NUMBER_OF_KIDS } from "@/lib/constants";
import { ID_DOCUMENT_ACCEPT, validateIdDocument } from "@/lib/id-documents";
import { GENDERS, MIN_AU_PAIR_AGE } from "@/lib/signup-rules";
import { useI18n } from "@/i18n";

/**
 * Champs obligatoires du profil (étape « Votre profil au pair » / « Votre famille ») — partagés par
 * le formulaire `/inscription` et la finalisation d'un compte Google/Facebook (`/inscription/completer`).
 * Les mêmes règles sont revérifiées côté serveur (`src/lib/signup-validation.server.ts`).
 */

export type SignupRole = "au-pair" | "famille";

export type ProfileForm = {
  country: string;
  gender: string;
  dateOfBirth: string;
  languages: string[];
  educationLevel: string;
  experience: string;
  city: string;
  numberOfKids: string;
  hostCountry: string;
};

export const EMPTY_PROFILE_FORM: ProfileForm = {
  country: "",
  gender: "",
  dateOfBirth: "",
  languages: [],
  educationLevel: "",
  experience: "",
  city: "",
  numberOfKids: "",
  hostCountry: "",
};

const EXPERIENCE_OPTIONS = [
  "Moins d'1 an",
  "1 an",
  "2 ans",
  "3 ans",
  "4 ans",
  "5 ans et plus",
];

/** Fond des pages d'inscription (`/inscription`, `/inscription/completer`). */
export const SIGNUP_PAGE_BACKGROUND =
  "bg-[radial-gradient(ellipse_at_top_left,rgba(232,119,34,0.06),transparent_50%),radial-gradient(ellipse_at_top_right,rgba(58,91,168,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(63,164,91,0.07),transparent_60%),linear-gradient(180deg,#F8F9FB_0%,#F5F6FA_55%,#F3F6F5_100%)] bg-fixed";

/** Ajoute les champs du profil au multipart envoyé à l'API (`languages` en JSON). */
export function appendProfileFields(body: FormData, role: SignupRole, form: ProfileForm) {
  const fields: Record<string, string> = {
    role,
    country: form.country,
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    languages: JSON.stringify(form.languages),
    educationLevel: form.educationLevel.trim(),
    experience: form.experience.trim(),
    city: form.city.trim(),
    numberOfKids: form.numberOfKids.trim(),
    hostCountry: form.hostCountry,
  };
  for (const [key, value] of Object.entries(fields)) body.append(key, value);
}

type I18n = ReturnType<typeof useI18n>;

/** Erreurs des champs obligatoires (vide = étape valide). */
export function getProfileFieldErrors(
  role: SignupRole,
  form: ProfileForm,
  { idDocument, withIdDocument }: { idDocument: File | null; withIdDocument: boolean },
  { t, tError }: Pick<I18n, "t" | "tError">,
): Record<string, string> {
  const e = t.signup.errors;
  const errs: Record<string, string> = {};
  if (role === "au-pair") {
    if (!form.country) errs.country = e.country;
    if (!form.gender) errs.gender = e.gender;
    if (!form.dateOfBirth) errs.dateOfBirth = e.dateOfBirth;
    else if (calculateAge(form.dateOfBirth) < MIN_AU_PAIR_AGE) errs.dateOfBirth = e.tooYoung;
    if (form.languages.length === 0) errs.languages = e.languages;
  } else {
    if (!form.hostCountry) errs.hostCountry = e.hostCountry;
    if (!form.city.trim()) errs.city = e.city;
    const kids = form.numberOfKids.trim();
    if (!kids) errs.numberOfKids = e.numberOfKids;
    else if (!/^\d+$/.test(kids) || Number(kids) > MAX_NUMBER_OF_KIDS)
      errs.numberOfKids = e.numberOfKidsInvalid(MAX_NUMBER_OF_KIDS);
    if (withIdDocument) {
      if (!idDocument) errs.idDocument = e.idDocument;
      else {
        const fileError = validateIdDocument(idDocument);
        if (fileError) errs.idDocument = tError(fileError, fileError);
      }
    }
  }
  return errs;
}

/** Classe d'un champ texte, bordure rouge en cas d'erreur. */
export function fieldInputClass(hasError: boolean) {
  return `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
    hasError ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-[#E87722]"
  }`;
}

type FieldsProps = {
  form: ProfileForm;
  onChange: (patch: Partial<ProfileForm>) => void;
  fieldError: (field: string) => string | null;
  markBlurred: (field: string) => void;
};

export function AuPairProfileFields({ form, onChange, fieldError, markBlurred }: FieldsProps) {
  const { t, tValue } = useI18n();
  const s = t.signup;
  const { origin: originCountries } = useCountries();
  const { languages: LANGUAGES, educationLevels: EDUCATION_LEVELS } = useConstants();
  const inputClass = (field: string) => fieldInputClass(!!fieldError(field));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {s.countryOfOrigin}
        </label>
        <SelectField
          value={form.country}
          onChange={(v) => onChange({ country: v })}
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
          onChange={(v) => onChange({ gender: v })}
          onBlur={() => markBlurred("gender")}
          invalid={!!fieldError("gender")}
          aria-label={s.gender}
          placeholder={s.select}
          options={GENDERS.map((v) => ({
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
        <DateField
          value={form.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(v) => onChange({ dateOfBirth: v })}
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
                  onChange({
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
          onChange={(v) => onChange({ educationLevel: v })}
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
          onChange={(v) => onChange({ experience: v })}
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
  );
}

export function FamilyProfileFields({
  form,
  onChange,
  fieldError,
  markBlurred,
  idDocument,
  setIdDocument,
  withIdDocument,
}: FieldsProps & {
  idDocument: File | null;
  setIdDocument: (file: File | null) => void;
  /** false : la famille a déjà déposé sa pièce d'identité (ancien compte) */
  withIdDocument: boolean;
}) {
  const { t, tValue } = useI18n();
  const s = t.signup;
  const { host: hostCountries } = useCountries();
  const inputClass = (field: string) => fieldInputClass(!!fieldError(field));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {s.hostCountry}
        </label>
        <SelectField
          value={form.hostCountry}
          onChange={(v) => onChange({ hostCountry: v })}
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
          onChange={(e) => onChange({ city: e.target.value })}
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
          onChange={(v) => onChange({ numberOfKids: v })}
          onBlur={() => markBlurred("numberOfKids")}
          invalid={!!fieldError("numberOfKids")}
          aria-label={s.numberOfKids}
          placeholder={s.select}
          options={["0", "1", "2", "3", "4"].map((n) => ({
            value: n,
            label: n,
          }))}
          allowCustom
          otherLabel={s.otherOption}
          customPlaceholder={s.numberOfKidsCustomPlaceholder}
        />
        {fieldError("numberOfKids") && (
          <p className="text-xs text-red-500 mt-1">
            {fieldError("numberOfKids")}
          </p>
        )}
      </div>
      {withIdDocument && (
        <div>
          <p className="block text-sm font-semibold text-gray-700 mb-1">
            {s.idDocument}
          </p>
          {idDocument ? (
            <div
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${
                fieldError("idDocument") ? "border-red-300" : "border-gray-200"
              }`}
            >
              <FileText className="w-5 h-5 text-[#E87722] shrink-0" />
              <span className="text-sm text-gray-700 truncate flex-1">
                {idDocument.name}
              </span>
              <button
                type="button"
                onClick={() => setIdDocument(null)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                aria-label={s.idDocumentRemove}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer text-sm transition-colors focus-within:ring-2 focus-within:ring-[#E87722] ${
                fieldError("idDocument")
                  ? "border-red-300 text-red-500"
                  : "border-gray-200 text-gray-500 hover:border-[#E87722] hover:text-[#E87722]"
              }`}
            >
              <Upload className="w-4 h-4" />
              {s.idDocumentChoose}
              <input
                type="file"
                accept={ID_DOCUMENT_ACCEPT}
                className="sr-only"
                onChange={(ev) => {
                  setIdDocument(ev.target.files?.[0] ?? null);
                  markBlurred("idDocument");
                  ev.target.value = "";
                }}
              />
            </label>
          )}
          {fieldError("idDocument") ? (
            <p className="text-xs text-red-500 mt-1">
              {fieldError("idDocument")}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">{s.idDocumentHint}</p>
          )}
        </div>
      )}
    </div>
  );
}
