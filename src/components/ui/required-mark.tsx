/** Astérisque rouge d'un libellé de champ obligatoire (le champ lui-même porte `required` / `aria-required`). */
export function RequiredMark() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}
