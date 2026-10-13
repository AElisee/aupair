"use client";
import { Shield, Eye, Lock, AlertTriangle, CheckCircle, UserCheck } from "lucide-react";
import { useI18n } from "@/i18n";

// Icônes, dans le même ordre que `security.standards` (src/i18n/site.ts)
const standardIcons = [UserCheck, Eye, Lock, AlertTriangle, Shield, CheckCircle];

export default function SecuriteContent() {
  const { t } = useI18n();
  const p = t.security;

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#E87722] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-3">{p.title}</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{p.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {p.standards.map((s, i) => {
            const Icon = standardIcons[i];
            return (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#E87722]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A2E] mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-[#1A1A2E] rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-1">{p.issueTitle}</p>
          <p className="text-gray-400 text-sm mb-4">{p.issueText}</p>
          <a href="mailto:securite@aupair-aeu.com" className="bg-[#E87722] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#d06619] transition-colors inline-block">
            securite@aupair-aeu.com
          </a>
        </div>
      </div>
    </div>
  );
}
