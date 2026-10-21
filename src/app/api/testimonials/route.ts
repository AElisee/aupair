import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { TESTIMONIAL_LIMITS, TESTIMONIAL_ROLES, type TestimonialRole } from "@/lib/testimonials-shared";

const SUBMIT_MAX_PER_IP = 3;
const SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

type TestimonialBody = {
  authorName?: unknown;
  authorRole?: unknown;
  authorCountry?: unknown;
  content?: unknown;
  rating?: unknown;
};

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Avis laissé par un visiteur : enregistré masqué, publié après validation dans /admin/avis. */
export async function POST(request: Request) {
  let body: TestimonialBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const authorName = text(body.authorName);
  const authorCountry = text(body.authorCountry);
  const content = text(body.content);
  const rating = Number(body.rating);
  const authorRole = body.authorRole as TestimonialRole;

  if (!authorName || authorName.length > TESTIMONIAL_LIMITS.name) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }
  if (!TESTIMONIAL_ROLES.includes(authorRole)) {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }
  if (authorCountry.length > TESTIMONIAL_LIMITS.country) {
    return NextResponse.json({ error: "Pays invalide." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "La note doit être comprise entre 1 et 5." }, { status: 400 });
  }
  if (content.length < TESTIMONIAL_LIMITS.contentMin || content.length > TESTIMONIAL_LIMITS.contentMax) {
    return NextResponse.json(
      { error: `L'avis doit contenir entre ${TESTIMONIAL_LIMITS.contentMin} et ${TESTIMONIAL_LIMITS.contentMax} caractères.` },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(`testimonial:ip:${ip}`, SUBMIT_MAX_PER_IP, SUBMIT_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop d'avis envoyés. Merci de réessayer plus tard." },
      { status: 429 }
    );
  }

  await prisma.testimonial.create({
    data: { authorName, authorRole, authorCountry, content, rating, isPublished: false },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
