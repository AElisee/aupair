"use client";
import { UserPlus, Search, MessageCircle, Home, Star } from "lucide-react";
import { useI18n } from "@/i18n";

// Icônes des étapes, dans le même ordre que `home.howItWorks.auPairSteps` / `familySteps` (src/i18n/site.ts)
const auPairIcons = [UserPlus, Search, MessageCircle];
const familyIcons = [Home, Search, Star];

function Steps({
  steps,
  icons,
  iconBg,
  iconColor,
}: {
  steps: readonly { title: string; desc: string }[];
  icons: React.ElementType[];
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="space-y-6">
      {steps.map((step, i) => {
        const Icon = icons[i];
        return (
          <div key={i} className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <h4 className="font-semibold text-[#1A1A2E] mb-1">
                <span className="text-[#E87722] mr-2">{i + 1}.</span>{step.title}
              </h4>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useI18n();
  const h = t.home.howItWorks;
  return (
    <section className="py-20 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1A2E] mb-4">{h.title}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{h.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Au pairs */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#E87722] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E]">{h.forAuPairs}</h3>
            </div>
            <Steps steps={h.auPairSteps} icons={auPairIcons} iconBg="bg-[#FFF3E0]" iconColor="text-[#E87722]" />
          </div>

          {/* Familles */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[#1A1A2E] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">FA</span>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E]">{h.forFamilies}</h3>
            </div>
            <Steps steps={h.familySteps} icons={familyIcons} iconBg="bg-[#F5F5F5]" iconColor="text-[#1A1A2E]" />
          </div>
        </div>
      </div>
    </section>
  );
}
