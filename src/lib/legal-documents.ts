// Helpers partagés (client + serveur) pour les documents légaux gérés depuis
// /admin/parametres/documents. Ne pas importer Prisma ici : ce fichier est
// aussi utilisé par la page admin côté client.

/** Documents ayant une URL publique dédiée (déjà liée depuis le footer / l'inscription). */
export const DEDICATED_DOCUMENT_PATHS: Record<string, string> = {
  cgu: "/cgu",
  cgv: "/cgv",
  confidentialite: "/confidentialite",
};

/** Identifiants suggérés dans le back-office lors de la création d'un document. */
export const SUGGESTED_DOCUMENTS = [
  { slug: "cgu", title: "Conditions générales d'utilisation", titleEn: "Terms of use" },
  { slug: "confidentialite", title: "Politique de confidentialité", titleEn: "Privacy policy" },
  { slug: "cgv", title: "Conditions générales de vente", titleEn: "Terms of sale" },
];

/** Transforme un texte libre en identifiant d'URL : minuscules, sans accents, tirets. */
export function normalizeDocumentSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** URL publique d'un document. */
export function getDocumentPublicPath(slug: string): string {
  return DEDICATED_DOCUMENT_PATHS[slug] ?? `/documents/${slug}`;
}

/**
 * Les documents sont stockés en HTML (éditeur Tiptap). Les premiers documents
 * étaient saisis dans un sous-ensemble de Markdown : on les reconnaît à
 * l'absence de balise en tête et on les convertit à la volée.
 */
export function isLegacyMarkdown(content: string): boolean {
  return content.trim() !== "" && !content.trimStart().startsWith("<");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inlineMarkdownToHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) =>
      /^(https?:\/\/|mailto:|\/(?!\/))/i.test(href) ? `<a href="${href}">${label}</a>` : label
    );
}

/** Convertit l'ancien Markdown (titres, listes, gras, liens) en HTML. */
export function markdownLiteToHtml(source: string): string {
  return source
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      const first = lines[0];
      if (first.startsWith("### ")) return `<h3>${inlineMarkdownToHtml(first.slice(4))}</h3>`;
      if (first.startsWith("## ")) return `<h2>${inlineMarkdownToHtml(first.slice(3))}</h2>`;
      if (first.startsWith("# ")) return `<h2>${inlineMarkdownToHtml(first.slice(2))}</h2>`;
      if (lines.every((l) => /^[-*]\s/.test(l))) {
        return `<ul>${lines.map((l) => `<li><p>${inlineMarkdownToHtml(l.replace(/^[-*]\s/, ""))}</p></li>`).join("")}</ul>`;
      }
      if (lines.every((l) => /^\d+\.\s/.test(l))) {
        return `<ol>${lines.map((l) => `<li><p>${inlineMarkdownToHtml(l.replace(/^\d+\.\s/, ""))}</p></li>`).join("")}</ol>`;
      }
      return `<p>${lines.map(inlineMarkdownToHtml).join("<br>")}</p>`;
    })
    .join("");
}

/** Contenu prêt pour l'éditeur ou l'affichage : HTML (ancien Markdown converti). */
export function toDocumentHtml(content: string): string {
  return isLegacyMarkdown(content) ? markdownLiteToHtml(content) : content;
}
