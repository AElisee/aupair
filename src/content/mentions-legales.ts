import type { LegalDocumentDTO } from "@/components/legal/LegalDocumentView";

/**
 * Mentions légales affichées sur /mentions-legales tant qu'aucun document
 * `mentions-legales` n'est publié depuis /admin/parametres/documents
 * (le document du back-office, s'il est publié, remplace ce contenu).
 */
export const DEFAULT_LEGAL_NOTICE: LegalDocumentDTO = {
  title: "Mentions légales",
  titleEn: "Legal notice",
  updatedAt: "2026-10-21T00:00:00.000Z",
  content: `
<h2>Éditeur du site</h2>
<p>Le site AuPair A.EU est édité par <strong>BODOU SERVICES</strong>.</p>
<p>Pour toute question concernant le site, vous pouvez nous écrire via la <a href="/contact">page de contact</a>.</p>
<h2>Hébergement</h2>
<p>Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — vercel.com.</p>
<p>Les données de la plateforme sont stockées par <strong>Supabase Inc.</strong> (base de données et fichiers).</p>
<h2>Propriété intellectuelle</h2>
<p>L'ensemble des contenus du site (textes, logo, images, mise en page) est la propriété de BODOU SERVICES ou de ses partenaires. Toute reproduction ou représentation, totale ou partielle, sans autorisation préalable est interdite.</p>
<h2>Données personnelles</h2>
<p>Le traitement des données personnelles des utilisateurs est décrit dans notre <a href="/confidentialite">politique de confidentialité</a>. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données, que vous pouvez exercer via la <a href="/contact">page de contact</a>.</p>
<h2>Cookies</h2>
<p>L'utilisation des cookies est détaillée dans notre <a href="/cookies">politique de cookies</a>.</p>
<h2>Responsabilité</h2>
<p>AuPair A.EU est une plateforme de mise en relation entre au pairs et familles d'accueil. BODOU SERVICES vérifie les profils avant leur publication mais ne peut garantir l'exactitude des informations fournies par les utilisateurs, ni être tenue responsable des accords conclus entre eux.</p>
`.trim(),
  contentEn: `
<h2>Publisher</h2>
<p>The AuPair A.EU website is published by <strong>BODOU SERVICES</strong>.</p>
<p>For any question about the website, you can write to us through the <a href="/contact">contact page</a>.</p>
<h2>Hosting</h2>
<p>The website is hosted by <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, United States — vercel.com.</p>
<p>Platform data is stored by <strong>Supabase Inc.</strong> (database and files).</p>
<h2>Intellectual property</h2>
<p>All content on the website (texts, logo, images, layout) is the property of BODOU SERVICES or its partners. Any full or partial reproduction or representation without prior permission is prohibited.</p>
<h2>Personal data</h2>
<p>How users' personal data is processed is described in our <a href="/confidentialite">privacy policy</a>. Under the GDPR, you have the right to access, correct and delete your data, which you can exercise through the <a href="/contact">contact page</a>.</p>
<h2>Cookies</h2>
<p>The use of cookies is detailed in our <a href="/cookies">cookie policy</a>.</p>
<h2>Liability</h2>
<p>AuPair A.EU is a platform connecting au pairs and host families. BODOU SERVICES checks profiles before they are published but cannot guarantee the accuracy of the information provided by users, nor be held liable for agreements made between them.</p>
`.trim(),
};
