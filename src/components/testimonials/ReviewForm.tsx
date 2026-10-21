"use client";
import { useState } from "react";
import { Star, CheckCircle, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { useCountries } from "@/hooks/useCountries";
import { useI18n } from "@/i18n";
import { TESTIMONIAL_LIMITS, TESTIMONIAL_ROLES } from "@/lib/testimonials-shared";

const emptyForm = { authorName: "", authorRole: "", authorCountry: "", rating: 0, content: "" };

/** Formulaire public d'avis (page /temoignages) : l'avis est publié après validation dans /admin/avis. */
export default function ReviewForm() {
  const { t, tValue, tError } = useI18n();
  const tp = t.testimonialsPage;
  const roles = t.home.testimonials.roles;
  const { origin, host } = useCountries();
  const [form, setForm] = useState(emptyForm);
  const [hoverRating, setHoverRating] = useState(0);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const countryOptions = [...origin, ...host]
    .map((c) => ({ value: c.name, label: tValue(c.name) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const errors: Record<string, string> = {};
  if (!form.authorName.trim()) errors.authorName = tp.errors.name;
  if (!form.authorRole) errors.authorRole = tp.errors.role;
  if (form.rating === 0) errors.rating = tp.errors.rating;
  if (form.content.trim().length < TESTIMONIAL_LIMITS.contentMin) errors.content = tp.errors.content(TESTIMONIAL_LIMITS.contentMin);
  const fieldError = (field: string) => (touched ? errors[field] : undefined);

  const inputClass = (field: string) =>
    `w-full border rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 ${
      fieldError(field) ? "border-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-[#E87722]"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: form.authorName.trim(),
          authorRole: form.authorRole,
          authorCountry: form.authorCountry.trim(),
          rating: form.rating,
          content: form.content.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(tError(data.error, tp.genericError));
        return;
      }
      setSent(true);
      setForm(emptyForm);
      setTouched(false);
    } catch {
      setError(tp.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{tp.sentTitle}</h3>
        <p className="text-gray-500 text-sm mb-6">{tp.sentText}</p>
        <Button variant="outline" onClick={() => setSent(false)}>
          {tp.sendAnother}
        </Button>
      </div>
    );
  }

  const shownRating = hoverRating || form.rating;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="review-name" className="block text-sm font-semibold text-gray-700 mb-1">{tp.name}</label>
          <input
            id="review-name"
            type="text"
            maxLength={TESTIMONIAL_LIMITS.name}
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            aria-invalid={!!fieldError("authorName")}
            className={inputClass("authorName")}
            placeholder={tp.namePlaceholder}
          />
          {fieldError("authorName") && <p className="text-xs text-red-500 mt-1">{fieldError("authorName")}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{tp.youAre}</label>
          <SelectField
            value={form.authorRole}
            onChange={(v) => setForm({ ...form, authorRole: v })}
            invalid={!!fieldError("authorRole")}
            aria-label={tp.youAre}
            placeholder={t.signup.select}
            options={TESTIMONIAL_ROLES.map((role) => ({ value: role, label: roles[role] }))}
          />
          {fieldError("authorRole") && <p className="text-xs text-red-500 mt-1">{fieldError("authorRole")}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{tp.country}</label>
          <SelectField
            value={form.authorCountry}
            onChange={(v) => setForm({ ...form, authorCountry: v.slice(0, TESTIMONIAL_LIMITS.country) })}
            aria-label={tp.country}
            placeholder={tp.countryPlaceholder}
            options={countryOptions}
            allowCustom
            otherLabel={tp.otherCountry}
            customPlaceholder={tp.otherCountryPlaceholder}
          />
        </div>
        <div>
          <p className="block text-sm font-semibold text-gray-700 mb-1">{tp.rating}</p>
          <div className="flex items-center gap-1 h-12" role="radiogroup" aria-label={tp.rating} onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={form.rating === n}
                aria-label={tp.rateStars(n)}
                onClick={() => setForm({ ...form, rating: n })}
                onMouseEnter={() => setHoverRating(n)}
                className="p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87722]"
              >
                <Star className={`w-7 h-7 transition-colors ${n <= shownRating ? "fill-[#E87722] text-[#E87722]" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
          {fieldError("rating") && <p className="text-xs text-red-500 mt-1">{fieldError("rating")}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="review-content" className="block text-sm font-semibold text-gray-700 mb-1">{tp.review}</label>
        <textarea
          id="review-content"
          rows={5}
          maxLength={TESTIMONIAL_LIMITS.contentMax}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          aria-invalid={!!fieldError("content")}
          className={`${inputClass("content")} resize-none`}
          placeholder={tp.reviewPlaceholder}
        />
        <div className="flex items-start justify-between gap-3 mt-1">
          <p className="text-xs text-red-500">{fieldError("content")}</p>
          <p className="text-xs text-gray-400 shrink-0">{tp.charCount(form.content.length, TESTIMONIAL_LIMITS.contentMax)}</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          <MessageSquarePlus className="w-4 h-4" /> {submitting ? tp.sending : tp.submit}
        </Button>
      </div>
    </form>
  );
}
