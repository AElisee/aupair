"use client";

import { useState } from "react";
import { Mail, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { SelectField } from "@/components/ui/select-field";

const SUBJECTS = ["inscription", "paiement", "profil", "signalement", "autre"] as const;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
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
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError(c.serverError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">{c.title}</h1>
          <p className="text-gray-500 text-lg">{c.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800 mb-2">{c.sentTitle}</h2>
                <p className="text-green-600">{c.sentText}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{c.fullName}</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder={c.namePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{c.email}</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder={c.emailPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{c.subject}</label>
                  <SelectField
                    required
                    value={form.subject}
                    onChange={(v) => setForm({ ...form, subject: v })}
                    placeholder={c.chooseSubject}
                    options={SUBJECTS.map((key) => ({ value: String(key), label: c.subjects[key] }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{c.message}</label>
                  <textarea
                    required value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent resize-none"
                    placeholder={c.messagePlaceholder}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {c.send}
                </Button>
              </form>
            )}
          </div>

          {/* Infos contact */}
          <div className="space-y-6">
            <div className="bg-[#FFF3E0] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] mb-1">Email</h3>
                  <p className="text-gray-600 text-sm">support@aupair-aeu.com</p>
                  <p className="text-gray-400 text-xs mt-1">{c.emailReply}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#FFF3E0] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] mb-1">WhatsApp</h3>
                  <p className="text-gray-600 text-sm">{c.whatsappText}</p>
                  <p className="text-gray-400 text-xs mt-1">{c.whatsappHours}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#FFF3E0] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] mb-1">{c.hoursTitle}</h3>
                  <p className="text-gray-600 text-sm">{c.hoursDays}</p>
                  <p className="text-gray-600 text-sm">{c.hoursTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
