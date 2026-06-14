/**
 * Convertit un emoji drapeau (ex: "🇫🇷") en code pays ISO 3166-1 alpha-2 ("fr").
 * Chaque lettre est codée par un "regional indicator symbol" (U+1F1E6 = A ... U+1F1FF = Z).
 */
function flagEmojiToCountryCode(flag: string): string | null {
  const chars = Array.from(flag);
  if (chars.length !== 2) return null;

  const code = chars
    .map((char) => {
      const codePoint = char.codePointAt(0);
      if (!codePoint || codePoint < 0x1f1e6 || codePoint > 0x1f1ff) return null;
      return String.fromCharCode(codePoint - 0x1f1e6 + 0x41);
    })
    .join("");

  return code.length === 2 ? code.toLowerCase() : null;
}

/**
 * Affiche le drapeau d'un pays sous forme d'image (via flagcdn.com), pour un rendu
 * cohérent sur toutes les plateformes — les emojis drapeau ne s'affichent pas comme
 * des drapeaux sur Windows (ils tombent en repli sur le code pays en lettres).
 */
export function CountryFlag({ flag, className }: { flag: string; className?: string }) {
  const code = flagEmojiToCountryCode(flag);

  if (!code) {
    return <span className={className}>{flag}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/h40/${code}.png`}
      srcSet={`https://flagcdn.com/h80/${code}.png 2x`}
      alt=""
      className={className}
    />
  );
}
