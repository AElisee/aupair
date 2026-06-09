"use client";

import { useState } from "react";
import { Mail, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: envoyer via API route
    setSubmitted(true);
  };

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1A1A2E] mb-4">Contactez-nous</h1>
          <p className="text-gray-500 text-lg">Notre équipe répond sous 24h ouvrées</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-800 mb-2">Message envoyé !</h2>
                <p className="text-green-600">Nous vous répondrons dans les 24h ouvrées.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sujet *</label>
                  <select
                    required value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent bg-white"
                  >
                    <option value="">Choisir un sujet</option>
                    <option value="inscription">Inscription / Compte</option>
                    <option value="paiement">Paiement / Abonnement</option>
                    <option value="profil">Mon profil</option>
                    <option value="signalement">Signalement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                  <textarea
                    required value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] focus:border-transparent resize-none"
                    placeholder="Décrivez votre question ou problème..."
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">Envoyer le message</Button>
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
                  <p className="text-gray-400 text-xs mt-1">Réponse sous 24h ouvrées</p>
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
                  <p className="text-gray-600 text-sm">Disponible pour les urgences</p>
                  <p className="text-gray-400 text-xs mt-1">Lun–Ven, 9h–18h (CET)</p>
                </div>
              </div>
            </div>
            <div className="bg-[#FFF3E0] rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] mb-1">Horaires de support</h3>
                  <p className="text-gray-600 text-sm">Lundi – Vendredi</p>
                  <p className="text-gray-600 text-sm">9h00 – 18h00 (CET)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
