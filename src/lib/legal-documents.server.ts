import { cache } from "react";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import { prisma } from "./prisma";
import { requireAdminSession } from "./admin";
import { toDocumentHtml } from "./legal-documents";
import type { LegalDocumentDTO } from "@/components/legal/LegalDocumentView";

const ALIGN = [/^(left|right|center|justify)$/];
const SIZE = [/^\d+(\.\d+)?(px|%)$/];

/**
 * Liste blanche des balises produites par l'éditeur Tiptap du back-office.
 * Tout le reste (scripts, attributs on*, styles arbitraires, iframes…) est retiré.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "mark",
    "ul", "ol", "li", "a", "blockquote", "hr",
    "table", "colgroup", "col", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    p: ["style"], h2: ["style"], h3: ["style"], h4: ["style"],
    // Tiptap coupe une liste en plusieurs <ol start="N"> quand un paragraphe s'intercale.
    ol: ["start"],
    th: ["colspan", "rowspan", "style"],
    td: ["colspan", "rowspan", "style"],
    table: ["style"],
    col: ["style"],
  },
  allowedStyles: {
    "*": { "text-align": ALIGN },
    table: { width: SIZE, "min-width": SIZE },
    col: { width: SIZE, "min-width": SIZE },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs): sanitizeHtml.Tag => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href },
      };
    },
  },
};

/** Convertit l'ancien Markdown si besoin puis filtre le HTML. */
export function sanitizeDocumentHtml(content: string): string {
  return sanitizeHtml(toDocumentHtml(content), SANITIZE_OPTIONS).trim();
}

/** Vrai si le HTML ne contient aucun texte visible (ex. `<p></p>`). */
export function isEmptyDocumentHtml(html: string): boolean {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, " ").trim() === "";
}

/**
 * Document publié pour une page publique, ou `null` s'il n'existe pas / est masqué.
 * Un admin voit aussi les brouillons, pour les prévisualiser depuis le back-office.
 */
export const getPublishedDocument = cache(async (slug: string): Promise<LegalDocumentDTO | null> => {
  const doc = await prisma.legalDocument.findUnique({ where: { slug } });
  if (!doc) return null;
  if (!doc.isPublished && !(await requireAdminSession())) return null;
  return {
    title: doc.title,
    titleEn: doc.titleEn,
    content: sanitizeDocumentHtml(doc.content),
    contentEn: doc.contentEn ? sanitizeDocumentHtml(doc.contentEn) : null,
    updatedAt: doc.updatedAt.toISOString(),
  };
});

export async function getDocumentMetadata(slug: string): Promise<Metadata> {
  const doc = await getPublishedDocument(slug);
  return { title: `${doc?.title ?? "Document"} — AuPair A.EU` };
}
