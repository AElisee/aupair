import { redirect } from "next/navigation";

// Fusionnée dans la page "Moyens de paiement"
export default function Page() {
  redirect("/admin/parametres/paiements");
}
