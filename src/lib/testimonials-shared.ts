/** Constantes et types des avis visiteurs, utilisables côté client (sans Prisma). */

/** Profil de l'auteur d'un avis, stocké dans `Testimonial.authorRole`. */
export const TESTIMONIAL_ROLES = ["AU_PAIR", "FAMILLE", "AUTRE"] as const;
export type TestimonialRole = (typeof TESTIMONIAL_ROLES)[number];

export const TESTIMONIAL_LIMITS = { name: 60, country: 60, contentMin: 20, contentMax: 1000 };

export type TestimonialDTO = {
  id: string;
  authorName: string;
  authorRole: string;
  authorCountry: string;
  content: string;
  rating: number;
  createdAt: string;
};
