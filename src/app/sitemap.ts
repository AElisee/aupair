import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aupair-aeu.com";

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/devenir-au-pair`, priority: 0.9 },
    { url: `${baseUrl}/accueillir-un-au-pair`, priority: 0.9 },
    { url: `${baseUrl}/trouver-au-pair`, priority: 0.9 },
    { url: `${baseUrl}/trouver-famille`, priority: 0.9 },
    { url: `${baseUrl}/tarifs`, priority: 0.8 },
    { url: `${baseUrl}/blog`, priority: 0.8 },
    { url: `${baseUrl}/faq`, priority: 0.7 },
    { url: `${baseUrl}/temoignages`, priority: 0.7 },
    { url: `${baseUrl}/contact`, priority: 0.6 },
    { url: `${baseUrl}/securite`, priority: 0.5 },
    { url: `${baseUrl}/mentions-legales`, priority: 0.3 },
    { url: `${baseUrl}/cgu`, priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, priority: 0.3 },
  ];

  const blogSlugs = [
    "comment-devenir-au-pair-en-france-2026",
    "regles-aupair-europe",
    "temoignage-cameroun-lyon",
    "matching-aupair-famille-conseils",
    "argent-poche-aupair-europe",
    "famille-accueil-choisir-aupair",
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: page.priority,
  }));
}
