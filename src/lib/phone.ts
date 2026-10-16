/** Groupe les chiffres d'un numéro local deux à deux : "0104050607" → "01 04 05 06 07". */
export function formatPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/(\d{2})(?=\d)/g, "$1 ");
}

/**
 * Met en forme un numéro complet pour l'affichage : "+225 0104050607" → "+225 01 04 05 06 07".
 * L'indicatif (premier bloc commençant par "+") est conservé tel quel.
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  const trimmed = phone.trim();
  const match = trimmed.match(/^(\+\d+)\s+(.*)$/);
  if (match) return `${match[1]} ${formatPhoneDigits(match[2])}`;
  // Indicatif collé au numéro : impossible de savoir où il s'arrête, on n'y touche pas
  if (trimmed.startsWith("+")) return trimmed;
  return formatPhoneDigits(trimmed);
}
