import { getCountriesByType } from "@/lib/countries";
import CountriesSectionView from "./CountriesSectionView";

// La section "Au pairs disponibles par pays" (pays d'origine) est masquée pour l'instant :
// seuls les pays d'accueil sont récupérés et affichés.
export default async function CountriesSection() {
  const host = await getCountriesByType("HOST");
  return <CountriesSectionView hostCountries={host.map((c) => ({ name: c.name, flag: c.flag }))} />;
}
