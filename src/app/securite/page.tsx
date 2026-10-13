import type { Metadata } from "next";
import SecuriteContent from "./SecuriteContent";

export const metadata: Metadata = { title: "Sécurité — AuPair A.EU" };

export default function SecuritePage() {
  return <SecuriteContent />;
}
