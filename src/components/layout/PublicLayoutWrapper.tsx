"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

const PRIVATE_PATHS = ["/dashboard", "/admin"];

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));

  return (
    <SessionProvider>
      <LanguageProvider>
        {!isPrivate && <Navbar />}
        <main className={isPrivate ? "min-h-dvh" : "flex-1"}>{children}</main>
        {!isPrivate && <Footer />}
      </LanguageProvider>
    </SessionProvider>
  );
}
