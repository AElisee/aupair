import { prisma } from "./prisma";
import type { TestimonialDTO } from "./testimonials-shared";

/** Avis publiés par l'admin, du plus récent au plus ancien. */
export async function getPublishedTestimonials(limit?: number): Promise<TestimonialDTO[]> {
  const rows = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    authorRole: r.authorRole,
    authorCountry: r.authorCountry,
    content: r.content,
    rating: r.rating,
    createdAt: r.createdAt.toISOString(),
  }));
}
