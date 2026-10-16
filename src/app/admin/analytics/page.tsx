import { redirect } from "next/navigation";

// Les graphiques Analytics sont désormais intégrés au tableau de bord
export default function AdminAnalyticsPage() {
  redirect("/admin");
}
