"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, Loader2, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { SelectField } from "@/components/ui/select-field";
import { CONTACT_EMAIL } from "@/lib/constants";

const SUBJECTS = ["inscription", "paiement", "profil", "signalement", "autre"] as const;

const EMPTY_FORM = { name: "", email: "", subject: "", customSubject: "", message: "" };

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent";

function InfoCard({ icon: Icon, title, children }: { icon: typeof Mail; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#E87722]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-[#1A1A2E] mb-1">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const { t, tError } = useI18n();
  const c = t.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(tError(data.error, c.error));
        return;
      }
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch {
      setError(c.serverError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E87722] opacity-15 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-24 sm:pt-14 sm:pb-28 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight">{c.title}</h1>
          <p className="text-gray-300 text-sm sm:text-base mt-3 max-w-xl mx-auto">{c.subtitle}</p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] pb-10 sm:pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative">
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 sm:gap-5 items-start">
            {/* ─── Formulaire ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
              {submitted ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
                  <h2 className="text-xl font-medium text-[#1A1A2E] mb-2">{c.sentTitle}</h2>
                  <p className="text-sm text-gray-500">{c.sentText}</p>
                  <Button variant="outline" className="mt-6 shadow-none" onClick={() => setSubmitted(false)}>
                    {c.sendAnother}
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-medium text-[#1A1A2E]">{c.formTitle}</h2>
                  <p className="text-sm text-gray-500 mt-1 mb-6">{c.formSubtitle}</p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{c.fullName}</label>
                        <input
                          type="text" required value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className={INPUT_CLASS}
                          placeholder={c.namePlaceholder}
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{c.email}</label>
                        <input
                          type="email" required value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className={INPUT_CLASS}
                          placeholder={c.emailPlaceholder}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{c.subject}</label>
                      <SelectField
                        required
                        value={form.subject}
                        onChange={(v) => setForm({ ...form, subject: v })}
                        placeholder={c.chooseSubject}
                        options={SUBJECTS.map((key) => ({ value: String(key), label: c.subjects[key] }))}
                      />
                    </div>
                    {form.subject === "autre" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{c.customSubject}</label>
                        <input
                          type="text" required maxLength={100} value={form.customSubject}
                          onChange={e => setForm({ ...form, customSubject: e.target.value })}
                          className={INPUT_CLASS}
                          placeholder={c.customSubjectPlaceholder}
                          autoFocus
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{c.message}</label>
                      <textarea
                        required minLength={10} value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        rows={6}
                        className={`${INPUT_CLASS} resize-none`}
                        placeholder={c.messagePlaceholder}
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full font-medium shadow-none" size="lg" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {c.send}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* ─── Infos contact ──────────────────────────────────────── */}
            <div className="space-y-4">
              <InfoCard icon={Mail} title={c.emailTitle}>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-[#E87722] hover:underline break-all"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="text-gray-400 text-xs mt-1">{c.emailReply}</p>
              </InfoCard>
              <InfoCard icon={HelpCircle} title={c.faqTitle}>
                <p className="text-gray-500 text-sm">{c.faqText}</p>
                <Link href="/faq" className="inline-flex items-center gap-1 text-sm text-[#E87722] font-medium mt-2 hover:underline">
                  {c.faqLink} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </InfoCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
