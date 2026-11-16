import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupDoneScreen } from "@/components/auth/SignupDoneScreen";

export const metadata: Metadata = {
  title: "Inscription réussie | AuPair A.EU",
  robots: { index: false },
};

/**
 * Confirmation après la finalisation d'une inscription Google/Facebook (`/inscription/completer`) :
 * l'utilisateur est déconnecté avant d'arriver ici, son compte attend la validation de l'équipe.
 */
export default async function SignupConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  if (role !== "au-pair" && role !== "famille") redirect("/connexion");
  return <SignupDoneScreen role={role} />;
}
