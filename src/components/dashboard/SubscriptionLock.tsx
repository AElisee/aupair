import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubscriptionBanner({
  message = "Abonnez-vous pour profiter de tous les avantages de la plateforme.",
  className = "",
}: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 flex-wrap bg-gradient-to-br from-[#E87722] to-[#ff9a3c] rounded-2xl p-4 text-white ${className}`}>
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Link href="/dashboard/au-pair/abonnement">
        <Button size="sm" className="bg-white text-[#E87722] hover:bg-white/90">S&apos;abonner</Button>
      </Link>
    </div>
  );
}

export function SubscriptionLockCard({
  title = "Fonctionnalité réservée aux abonnés",
  message = "Abonnez-vous pour profiter de tous les avantages de la plateforme.",
}: { title?: string; message?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <div className="w-12 h-12 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-3">
        <Lock className="w-6 h-6 text-[#E87722]" />
      </div>
      <h3 className="font-bold text-[#1A1A2E] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      <Link href="/dashboard/au-pair/abonnement">
        <Button size="sm">S&apos;abonner maintenant</Button>
      </Link>
    </div>
  );
}
