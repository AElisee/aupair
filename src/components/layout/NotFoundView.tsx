"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { useI18n } from "@/i18n";
import { getDefaultRedirectForRole } from "@/lib/safe-redirect";

/** Contenu de la page 404, dans la langue active. */
export default function NotFoundView() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = useSession();
  const dashboardUrl = session?.user ? getDefaultRedirectForRole(session.user.role) : null;

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <section className="flex-1 flex items-center justify-center bg-[#F5F5F5] px-4 py-16 min-h-[70dvh]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-base sm:text-xl mb-8">
          <Image
            src="/Logo_au_pair.png"
            alt="AuPair A.EU"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
            priority
          />
          <span className="text-[#1A1A2E]">AuPair</span>
          <span className="text-[#E87722]">A.EU</span>
        </Link>

        <p className="text-7xl sm:text-8xl font-extrabold leading-none text-[#E87722]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-[#1A1A2E]">{t.notFound.title}</h1>
        <p className="mt-3 text-gray-600">{t.notFound.text}</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#E87722] text-white text-sm font-semibold hover:bg-[#d06619] transition-colors"
          >
            <Home className="w-4 h-4" />
            {t.notFound.home}
          </Link>
          {dashboardUrl && dashboardUrl !== "/" ? (
            <Link
              href={dashboardUrl}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border-2 border-[#E87722] text-[#E87722] text-sm font-semibold hover:bg-[#FFF3E0] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.notFound.mySpace}
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border-2 border-[#E87722] text-[#E87722] text-sm font-semibold hover:bg-[#FFF3E0] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.notFound.back}
            </button>
          )}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          {t.notFound.help}{" "}
          <Link href="/contact" className="text-[#E87722] font-medium hover:underline">
            {t.notFound.contact}
          </Link>
        </p>
      </div>
    </section>
  );
}
