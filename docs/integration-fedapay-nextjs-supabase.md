# Intégration FedaPay dans une application Next.js + Supabase

Guide d'intégration complet, rédigé à partir de la documentation officielle FedaPay (docs.fedapay.com : librairies, authentification, gestion des clés, gestion des clients, gestion des collectes, envoi de requêtes, webhooks, SDKs Node.js / React, méthodes de paiement, référence API).

Stack visée : **Next.js 14/15 (App Router, TypeScript)** + **Supabase (Postgres, Auth, RLS, Edge Functions)**.

---

## Sommaire

1. Comprendre le fonctionnement de FedaPay
2. Prérequis et récupération des clés API
3. Architecture de l'intégration
4. Variables d'environnement
5. Schéma de base de données Supabase
6. Installation et configuration du SDK
7. Créer une transaction (Route Handler sécurisé)
8. Encaisser : les 3 parcours de paiement
9. La page de retour (callback_url)
10. Les webhooks : la seule source de vérité
11. Alternative : webhook dans une Supabase Edge Function
12. Tester en sandbox
13. Passer en production (checklist)
14. Erreurs fréquentes et bonnes pratiques
15. Annexes (endpoints, statuts, événements, méthodes de paiement)

---

## 1. Comprendre le fonctionnement de FedaPay

FedaPay est une passerelle de paiement d'Afrique de l'Ouest qui agrège le mobile money (MTN, Moov, Celtiis, Mixx by Yas, Airtel, Free Sénégal, Coris, BMO...) et les cartes Visa/Mastercard.

Points structurants à retenir avant d'écrire la moindre ligne de code :

- **Deux environnements totalement étanches** : *sandbox* (test) et *live* (production). Les objets créés dans l'un n'existent pas dans l'autre.
- **Deux URLs de base** : `https://sandbox-api.fedapay.com` et `https://api.fedapay.com`, préfixées par `/v1`.
- **Quatre clés API** par compte : clé publique et clé secrète, en version sandbox et en version live. La clé publique sert uniquement au front (widget checkout) ; la clé secrète ne doit **jamais** quitter le serveur.
- **Objet central : la transaction (collecte)**. On crée une transaction, on génère un *token* + une *URL de paiement*, puis le client paie.
- **Le montant est un entier**. En XOF il n'y a pas de décimales : 2000 = 2 000 FCFA.
- **Le statut renvoyé dans l'URL de retour n'est pas fiable** : la documentation demande explicitement de re-vérifier le statut côté serveur via l'API ou via le webhook.
- **Une transaction `pending` non finalisée expire automatiquement au bout de 24 h.**

Le flux nominal est le suivant :

```
Next.js (client)  ->  Route Handler Next.js (serveur, clé secrète)
                          |
                          v
                  POST /v1/transactions            -> id de transaction
                  POST /v1/transactions/:id/token  -> { token, url }
                          |
                          v
              Enregistrement dans Supabase (status = pending)
                          |
       +------------------+--------------------------+
       |                                             |
   Redirection / widget vers la page de paiement   Webhook FedaPay
       |                                             |
   Retour sur callback_url (non fiable)     POST /api/fedapay/webhook
       |                                             |
       +----> Vérification serveur du statut <-------+
                          |
                  Mise à jour Supabase (approved / declined / ...)
```

---

## 2. Prérequis et récupération des clés API

1. Créez un compte marchand sur FedaPay et faites-le valider (un compte peut être rejeté : pièces illisibles, informations incohérentes, activité non éligible — soignez le dossier).
2. Dans le tableau de bord, basculez en mode **sandbox** et récupérez :
   - la clé publique `pk_sandbox_...`
   - la clé secrète `sk_sandbox_...`
3. Faites de même en mode **live** une fois l'intégration validée (`pk_live_...` / `sk_live_...`).
4. Créez un **webhook** dans le tableau de bord (section Webhooks) pointant vers votre URL Next.js, et révélez sa **clé secrète de signature** (`wh_sandbox_...` / `wh_live_...`). Cette clé est différente entre sandbox et live, et unique par endpoint.

> Règle de sécurité rappelée par FedaPay : la clé secrète a le même niveau de sensibilité qu'un mot de passe administrateur. Elle ne va **jamais** dans Git, ni dans un bundle client, ni dans un ticket de support. FedaPay ne vous la demandera jamais. En cas de doute sur une fuite, régénérez-la immédiatement depuis le tableau de bord.

---

## 3. Architecture de l'intégration

Arborescence recommandée :

```
app/
  api/
    fedapay/
      create-transaction/route.ts   # crée la transaction + token (serveur)
      status/[id]/route.ts          # vérifie le statut réel côté serveur
      webhook/route.ts              # réception des événements FedaPay
      pay/route.ts                  # (option) paiement mobile sans redirection
  paiement/
    page.tsx                        # formulaire / bouton de paiement
    retour/page.tsx                 # page de callback_url
lib/
  fedapay.ts                        # client FedaPay (serveur uniquement)
  supabase/
    server.ts                       # client Supabase côté serveur (cookies)
    admin.ts                        # client service_role (webhook, RPC)
supabase/
  migrations/0001_payments.sql
  functions/fedapay-webhook/index.ts  # alternative Edge Function
```

Principes :

- **Aucune création de transaction depuis le navigateur.** Le client envoie seulement un identifiant métier (id de commande, id de plan) ; le serveur calcule le montant. Sinon un utilisateur peut payer 1 FCFA pour un article à 50 000 FCFA.
- **Le montant fait autorité côté base de données**, jamais côté formulaire.
- **La table `payments` est écrite par le serveur** (service_role) et seulement lue par l'utilisateur propriétaire (RLS).
- **Le webhook est la source de vérité** pour passer une commande à "payée".

---

## 4. Variables d'environnement

`.env.local` (jamais committé) :

```bash
# --- FedaPay ---
FEDAPAY_ENVIRONMENT=sandbox              # sandbox | live
FEDAPAY_SECRET_KEY=sk_sandbox_xxxxxxxxxxxx
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_xxxxxxxxxxxx
NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY=pk_sandbox_xxxxxxxxxxxx   # widget front uniquement

# --- Application ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # serveur uniquement, jamais NEXT_PUBLIC_
```

Seules les variables préfixées `NEXT_PUBLIC_` sont exposées au navigateur : la clé secrète et la clé service_role ne doivent jamais l'être. En production (Vercel, etc.), déclarez ces variables dans le gestionnaire de secrets de la plateforme.

---

## 5. Schéma de base de données Supabase

`supabase/migrations/0001_payments.sql` :

```sql
-- Statuts alignés sur le cycle de vie FedaPay
create type payment_status as enum (
  'pending', 'approved', 'declined', 'canceled',
  'refunded', 'transferred', 'expired'
);

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  order_id            uuid,                    -- votre référence métier
  merchant_reference  text unique not null,    -- envoyé à FedaPay
  fedapay_transaction_id  bigint unique,       -- id renvoyé par FedaPay
  amount              integer not null check (amount > 0),
  currency            text    not null default 'XOF',
  description         text,
  status              payment_status not null default 'pending',
  payment_url         text,
  payment_token       text,
  mode                text,                    -- mtn, moov, celtiis, card...
  customer_email      text,
  customer_phone      text,
  metadata            jsonb   not null default '{}'::jsonb,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index payments_user_id_idx on public.payments(user_id);
create index payments_status_idx  on public.payments(status);

-- Idempotence des webhooks : on mémorise les événements déjà traités
create table public.fedapay_events (
  id            text primary key,        -- identifiant unique de l'événement
  name          text not null,
  payload       jsonb not null,
  processed_at  timestamptz not null default now()
);

-- RLS
alter table public.payments        enable row level security;
alter table public.fedapay_events  enable row level security;

-- L'utilisateur voit uniquement ses propres paiements
create policy "read own payments"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- Aucune policy insert/update pour authenticated : seul le service_role écrit
-- (le service_role contourne la RLS)

-- Mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();
```

Le champ `merchant_reference` est important : FedaPay permet de retrouver une transaction avec **votre** référence via `GET /v1/transactions/merchant/{reference}`. Elle doit être **unique**, sinon la création de la transaction échoue.

---

## 6. Installation et configuration du SDK

```bash
npm install fedapay --save          # SDK serveur (Node.js)
npm install fedapay-reactjs --save  # optionnel : bouton / widget React
npm install @supabase/supabase-js @supabase/ssr
```

`lib/fedapay.ts` — configuration centralisée (fichier **serveur uniquement**) :

```ts
import 'server-only';
import { FedaPay, Transaction, Customer } from 'fedapay';

let configured = false;

export function initFedaPay() {
  if (configured) return;
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
  FedaPay.setEnvironment(
    (process.env.FEDAPAY_ENVIRONMENT ?? 'sandbox') as 'sandbox' | 'live'
  );
  configured = true;
}

export { FedaPay, Transaction, Customer };

export const FEDAPAY_API_BASE =
  process.env.FEDAPAY_ENVIRONMENT === 'live'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1';
```

Trois précautions spécifiques à Next.js :

- Le SDK `fedapay` est un paquet Node : les routes qui l'utilisent doivent déclarer `export const runtime = 'nodejs'` (il ne fonctionne pas sur l'Edge Runtime).
- `FedaPay.setApiKey()` configure un **singleton global**. Si vous manipulez plusieurs comptes ou plusieurs environnements dans le même processus, préférez les appels HTTP directs (voir plus bas) pour éviter les conditions de course.
- Ajoutez `export const dynamic = 'force-dynamic'` sur les routes de paiement pour éviter toute mise en cache.

### Variante sans SDK (fetch natif)

Le SDK est pratique mais l'API REST se consomme très bien avec `fetch`, ce qui évite toute dépendance et fonctionne partout :

```ts
import 'server-only';
import { FEDAPAY_API_BASE } from './fedapay';

export async function fedapayFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(FEDAPAY_API_BASE + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + process.env.FEDAPAY_SECRET_KEY!,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 400 = paramètres invalides, 401 = mauvaise clé (test vs live),
    // 404 = ressource inexistante, 500 = incident FedaPay
    throw new Error('FedaPay ' + res.status + ' : ' + JSON.stringify(body));
  }
  return body as T;
}
```

---

## 7. Créer une transaction (Route Handler sécurisé)

`app/api/fedapay/create-transaction/route.ts` :

```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { initFedaPay, Transaction } from '@/lib/fedapay';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { orderId } = await req.json();

  // 1. Le montant vient TOUJOURS de la base, jamais du client
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, total_amount, label')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const merchantReference = 'CMD-' + order.id + '-' + randomUUID().slice(0, 8);
  const admin = createAdminClient();

  initFedaPay();

  // 2. Création de la collecte chez FedaPay
  const transaction = await Transaction.create({
    description: order.label ?? 'Commande ' + order.id,
    amount: order.total_amount,                 // entier, en XOF
    currency: { iso: 'XOF' },
    callback_url: process.env.NEXT_PUBLIC_SITE_URL + '/paiement/retour',
    customer: {
      email: user.email,
      firstname: user.user_metadata?.firstname ?? 'Client',
      lastname: user.user_metadata?.lastname ?? '-',
      // phone_number: { number: '97000000', country: 'bj' },
    },
    merchant_reference: merchantReference,
    custom_metadata: {
      user_id: user.id,
      order_id: order.id,
      app: 'mon-app-nextjs',
    },
  });

  // 3. Génération du token + lien de paiement
  const { token, url } = await (transaction as any).generateToken();

  // 4. Trace locale AVANT la redirection
  const { error: insertError } = await admin.from('payments').insert({
    user_id: user.id,
    order_id: order.id,
    merchant_reference: merchantReference,
    fedapay_transaction_id: (transaction as any).id,
    amount: order.total_amount,
    currency: 'XOF',
    description: order.label,
    status: 'pending',
    payment_url: url,
    payment_token: token,
    customer_email: user.email,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Erreur enregistrement' }, { status: 500 });
  }

  return NextResponse.json({ url, token, id: (transaction as any).id });
}
```

Équivalent sans SDK (deux appels REST) :

```ts
const tx = await fedapayFetch<any>('/transactions', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Commande 1234',
    amount: 2000,
    currency: { iso: 'XOF' },
    callback_url: process.env.NEXT_PUBLIC_SITE_URL + '/paiement/retour',
    customer: { email: 'john.doe@example.com' },
    merchant_reference: merchantReference,
    custom_metadata: { order_id: '1234' },
  }),
});

const transactionId = tx['v1/transaction'].id;

const link = await fedapayFetch<{ token: string; url: string }>(
  '/transactions/' + transactionId + '/token',
  { method: 'POST' }
);
// link.url  -> page de paiement hébergée par FedaPay
// link.token -> nécessaire pour le paiement sans redirection
```

Champs utiles à la création (`POST /v1/transactions`) :

| Champ | Type | Rôle |
|---|---|---|
| `description` | string | Libellé affiché au client |
| `amount` | integer | Montant, entier obligatoire |
| `currency` | object | `{ iso: 'XOF' }` |
| `callback_url` | url | Retour du client après paiement (facultatif) |
| `customer` | object | `{ id }` si déjà connu, sinon `{ email, firstname, lastname, phone_number }` |
| `merchant_reference` | string | Votre référence unique (échec si doublon) |
| `custom_metadata` | object | Paires clé/valeur libres, non sensibles |
| `mode` | string | Force une méthode (`mtn_open`, `moov`, ...) |

À propos du `customer` : il est facultatif, mais FedaPay identifie un client **par son email**. Deux transactions avec le même email visent le même client, et les nom/prénom/téléphone envoyés écrasent les anciens. Utilisez donc des emails réellement uniques par utilisateur.

---

## 8. Encaisser : les 3 parcours de paiement

### 8.1 Redirection vers la page de paiement hébergée (le plus simple)

C'est le parcours recommandé pour démarrer : il couvre tous les moyens de paiement, y compris les cartes.

```tsx
'use client';
import { useState } from 'react';

export function PayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const res = await fetch('/api/fedapay/create-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;   // page FedaPay
    else setLoading(false);
  }

  return (
    <button onClick={pay} disabled={loading} className="btn btn-primary">
      {loading ? 'Redirection...' : 'Payer'}
    </button>
  );
}
```

### 8.2 Widget / bouton embarqué (checkout.js ou fedapay-reactjs)

L'utilisateur reste sur votre site, le formulaire s'ouvre dans une modale ou un conteneur. Le widget fonctionne avec la **clé publique**.

Chargement du script (App Router, dans le layout ou la page concernée) :

```tsx
import Script from 'next/script';

<Script src="https://cdn.fedapay.com/checkout.js?v=1.1.7" strategy="afterInteractive" />
```

Avec `fedapay-reactjs` (composant client, désactivez le SSR car le widget touche à `window`) :

```tsx
'use client';
import dynamic from 'next/dynamic';

const FedaCheckoutButton = dynamic(
  () => import('fedapay-reactjs').then((m) => m.FedaCheckoutButton),
  { ssr: false }
);

export function WidgetPay() {
  const options = {
    public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY!,
    transaction: { amount: 2000, description: 'Abonnement premium' },
    currency: { iso: 'XOF' },
    button: { class: 'btn btn-primary', text: 'Payer 2 000 FCFA' },
    onComplete(resp: any) {
      const FedaPay = (window as any).FedaPay;
      if (resp.reason === FedaPay.DIALOG_DISMISSED) {
        // l'utilisateur a fermé la modale
        return;
      }
      // NE PAS créditer ici : on demande au serveur le statut réel
      fetch('/api/fedapay/status/' + resp.transaction.id).then(/* ... */);
    },
  };

  return <FedaCheckoutButton options={options} />;
}
```

Il existe aussi `FedaCheckoutContainer` pour un formulaire embarqué directement dans la page.

Attention : dans React, le widget manipule l'objet global `window.FedaPay`. Si le composant est démonté avant la fin de la transaction, vous pouvez obtenir des erreurs ; gardez le composant monté pendant le paiement et testez l'existence de `window.FedaPay` avant tout appel. Et surtout, **le callback `onComplete` n'est pas une preuve de paiement** : il s'exécute côté navigateur et peut être simulé.

### 8.3 Paiement mobile money sans redirection (API)

Disponible pour certains opérateurs (MTN Bénin/CI, Moov Bénin/Togo, Celtiis, Mixx by Yas, Airtel Niger, Free Sénégal). Le client saisit son numéro chez vous, reçoit une notification push USSD sur son téléphone et valide.

Deux étapes : créer la transaction (`/transactions` puis `/transactions/:id/token`), puis déclencher l'envoi avec le mode choisi.

```ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { fedapayFetch } from '@/lib/fedapay-fetch';

export async function POST(req: Request) {
  const { token, mode, number, country } = await req.json();
  // mode : 'mtn_open' | 'moov' | 'celtiis' | 'mtn_ci' | 'togocel' | 'momo_test'...

  const result = await fedapayFetch('/' + mode, {
    method: 'POST',
    body: JSON.stringify({
      token,
      phone_number: { number, country },  // ex: { number: '64000001', country: 'bj' }
    }),
  });

  // La transaction reste 'pending' : c'est le webhook qui confirmera
  return NextResponse.json({ sent: true, result });
}
```

Avec le SDK Node : `transaction.sendNowWithToken(mode, { number, country })`.

Notes : le `phone_number` est facultatif — sans lui, FedaPay notifie le numéro rattaché au client de la transaction. Selon la version de l'API, l'endpoint d'envoi s'écrit `POST /v1/{mode}` ou `POST /v1/transactions/{mode}` ; vérifiez dans la référence API interactive celui qui répond pour votre compte, ou utilisez simplement la méthode du SDK.

---

## 9. La page de retour (callback_url)

FedaPay renvoie le client sur votre `callback_url` avec deux paramètres, par exemple :

```
https://mon-site.com/paiement/retour?id=258&status=approved
https://mon-site.com/paiement/retour?id=259&status=canceled
```

**Ces paramètres ne doivent jamais servir à valider un paiement** : n'importe qui peut ouvrir cette URL en tapant `status=approved`. La documentation FedaPay insiste sur ce point. La page de retour sert uniquement à afficher un message ; la vérification se fait côté serveur.

`app/paiement/retour/page.tsx` (Server Component) :

```tsx
export const dynamic = 'force-dynamic';

import { initFedaPay, Transaction } from '@/lib/fedapay';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function RetourPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) return <p>Paiement introuvable.</p>;

  initFedaPay();

  // Vérification directe auprès de FedaPay : seule source fiable
  const tx: any = await Transaction.retrieve(Number(id));

  // Synchronisation défensive (le webhook peut arriver un peu plus tard)
  const admin = createAdminClient();
  await admin
    .from('payments')
    .update({
      status: tx.status,
      paid_at: tx.status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('fedapay_transaction_id', tx.id)
    .neq('status', 'approved');   // ne jamais rétrograder un paiement validé

  if (tx.status === 'approved' || tx.status === 'transferred') {
    return <p>Paiement confirmé. Merci !</p>;
  }
  if (tx.status === 'pending') {
    return <p>Paiement en cours de traitement, patientez quelques instants...</p>;
  }
  return <p>Paiement non abouti ({tx.status}). Vous pouvez réessayer.</p>;
}
```

Route de vérification réutilisable (utile pour le widget et le polling) — `app/api/fedapay/status/[id]/route.ts` :

```ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { initFedaPay, Transaction } from '@/lib/fedapay';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  // On vérifie que ce paiement appartient bien à l'utilisateur
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('fedapay_transaction_id', Number(id))
    .eq('user_id', user.id)
    .single();

  if (!payment) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  initFedaPay();
  const tx: any = await Transaction.retrieve(Number(id));
  return NextResponse.json({ status: tx.status, amount: tx.amount });
}
```

---

## 10. Les webhooks : la seule source de vérité

FedaPay envoie une requête `POST` à votre endpoint à chaque événement, signée dans l'en-tête `X-FEDAPAY-SIGNATURE`, et attend une réponse **2xx**. Tout autre code est considéré comme un échec : jusqu'à 9 nouvelles tentatives à intervalles exponentiels (moins de 2 minutes d'attente), puis désactivation automatique du webhook après 10 échecs (comportement désactivable dans le tableau de bord). Un redéclenchement manuel reste possible depuis les *Logs* du webhook.

Contraintes techniques imposées par FedaPay :
- URL en **HTTPS** avec un certificat valide (TLS 1.2 ou 1.3 uniquement) ;
- réponse **2xx rapide**, avant tout traitement lourd ;
- gestion des **doublons** (le même événement peut arriver plusieurs fois) ;
- abonnement **uniquement aux événements utiles**, pour ne pas saturer votre serveur.

`app/api/fedapay/webhook/route.ts` :

```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Webhook } from 'fedapay';
import { createAdminClient } from '@/lib/supabase/admin';

const ENDPOINT_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // 1. Corps BRUT obligatoire : ne jamais parser avant de vérifier la signature
  const rawBody = await req.text();
  const signature = req.headers.get('x-fedapay-signature') ?? '';

  let event: any;
  try {
    event = Webhook.constructEvent(rawBody, signature, ENDPOINT_SECRET);
  } catch (err: any) {
    return new NextResponse('Webhook Error: ' + err.message, { status: 400 });
  }

  const admin = createAdminClient();

  // 2. Idempotence : on ignore un événement déjà traité
  const eventId = String(event.id ?? event.entity?.id ?? '') + ':' + event.name;
  const { error: dupError } = await admin
    .from('fedapay_events')
    .insert({ id: eventId, name: event.name, payload: event });

  if (dupError) {
    // clé dupliquée -> événement déjà traité : on acquitte quand même
    return NextResponse.json({ received: true, duplicate: true });
  }

  // 3. Traitement
  const entity = event.entity ?? event.object ?? {};

  switch (event.name) {
    case 'transaction.approved':
    case 'transaction.transferred': {
      await admin
        .from('payments')
        .update({ status: event.name.split('.')[1], paid_at: new Date().toISOString() })
        .eq('fedapay_transaction_id', entity.id);

      // Déclenchez ici votre logique métier :
      // marquer la commande payée, activer l'abonnement, envoyer l'email...
      break;
    }
    case 'transaction.declined':
    case 'transaction.canceled':
    case 'transaction.expired': {
      await admin
        .from('payments')
        .update({ status: event.name.split('.')[1] })
        .eq('fedapay_transaction_id', entity.id)
        .neq('status', 'approved');
      break;
    }
    case 'transaction.refunded': {
      await admin
        .from('payments')
        .update({ status: 'refunded' })
        .eq('fedapay_transaction_id', entity.id);
      break;
    }
    default:
      // transaction.created, transaction.updated, customer.*, etc.
      break;
  }

  // 4. Toujours répondre 2xx
  return NextResponse.json({ received: true });
}
```

### Vérification manuelle de la signature (sans SDK)

L'en-tête contient un horodatage et une signature HMAC-SHA256 du contenu, ce qui bloque les attaques par rejeu : un horodatage trop ancien doit être refusé, et il ne peut pas être modifié sans invalider la signature. Si vous n'utilisez pas le SDK, inspirez-vous de ce schéma (vérifiez le format exact de l'en-tête renvoyé par votre compte dans les logs du webhook) :

```ts
import crypto from 'crypto';

function verifySignature(rawBody: string, header: string, secret: string) {
  // Format attendu : "t=1712345678,s=abc123..."
  const parts = Object.fromEntries(
    header.split(',').map((p) => p.trim().split('='))
  ) as { t?: string; s?: string };

  if (!parts.t || !parts.s) throw new Error('Signature absente');

  // Rejet des requêtes trop anciennes (fenêtre de 5 minutes)
  const age = Math.floor(Date.now() / 1000) - Number(parts.t);
  if (age > 300) throw new Error('Horodatage expiré');

  const expected = crypto
    .createHmac('sha256', secret)
    .update(parts.t + '.' + rawBody)
    .digest('hex');

  const ok = crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(parts.s)
  );
  if (!ok) throw new Error('Signature invalide');
}
```

En complément, FedaPay émet ses webhooks depuis une liste d'adresses IP définie : vous pouvez restreindre l'accès à votre endpoint à ces IP.

### Traitement asynchrone

FedaPay recommande de ne pas traiter l'événement de façon synchrone. Si votre logique métier est lourde (emails, PDF, appels tiers), enregistrez l'événement puis répondez 200 immédiatement, et laissez un worker consommer la file. Avec Supabase, plusieurs options : une table `jobs` consommée par un cron, `pg_cron`, `pgmq`, ou un trigger Postgres qui appelle une Edge Function via `pg_net`.

---

## 11. Alternative : webhook dans une Supabase Edge Function

Utile si vous préférez découpler complètement les paiements de Next.js (le endpoint reste disponible même pendant un redéploiement du front).

`supabase/functions/fedapay-webhook/index.ts` :

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2';

const secret = Deno.env.get('FEDAPAY_WEBHOOK_SECRET')!;

async function hmacHex(key: string, data: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const raw = await req.text();
  const header = req.headers.get('x-fedapay-signature') ?? '';
  const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));

  if (!parts.t || !parts.s) return new Response('Signature absente', { status: 400 });
  if (await hmacHex(secret, parts.t + '.' + raw) !== parts.s) {
    return new Response('Signature invalide', { status: 400 });
  }

  const event = JSON.parse(raw);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  await supabase.from('fedapay_events').insert({
    id: String(event.id) + ':' + event.name,
    name: event.name,
    payload: event,
  });

  if (event.name === 'transaction.approved') {
    await supabase
      .from('payments')
      .update({ status: 'approved', paid_at: new Date().toISOString() })
      .eq('fedapay_transaction_id', event.entity.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Déploiement :

```bash
supabase secrets set FEDAPAY_WEBHOOK_SECRET=wh_sandbox_xxx
supabase functions deploy fedapay-webhook --no-verify-jwt
# URL : https://<project-ref>.supabase.co/functions/v1/fedapay-webhook
```

Le flag `--no-verify-jwt` est indispensable : FedaPay n'envoie pas de JWT Supabase. La sécurité repose alors entièrement sur la vérification de signature.

---

## 12. Tester en sandbox

1. Utilisez exclusivement les clés `sk_sandbox_...` / `pk_sandbox_...` et l'URL `https://sandbox-api.fedapay.com`. Une clé de test sur le serveur live (ou l'inverse) renvoie une erreur **401**.
2. FedaPay fournit un mode de paiement de test unique : **`momo_test`** (les anciens environnements de test par opérateur ont été supprimés).
   - **Succès** : uniquement les numéros `64000001` et `66000001`.
   - **Échec** : n'importe quel autre numéro simule un paiement échoué.
3. Exposez votre webhook local avec un tunnel HTTPS pour recevoir les événements :

```bash
npx localtunnel --port 3000
# ou : ngrok http 3000
# puis déclarez https://xxxx.ngrok-free.app/api/fedapay/webhook dans le dashboard
```

4. Scénarios à couvrir avant la mise en production :

| Scénario | Attendu |
|---|---|
| Paiement réussi (redirection) | `payments.status = approved`, commande marquée payée |
| Paiement échoué / refusé | statut `declined` ou `canceled`, aucun accès accordé |
| Fermeture de la modale du widget | aucune écriture métier |
| Retour manuel sur `/paiement/retour?id=X&status=approved` falsifié | aucun crédit accordé |
| Webhook rejoué deux fois | traitement une seule fois (idempotence) |
| Webhook avec mauvaise signature | réponse 400, aucune écriture |
| Transaction abandonnée 24 h | statut `expired` |
| Remboursement depuis le dashboard | statut `refunded` propagé |

5. La référence API de FedaPay embarque un mode d'essai interactif : pratique pour comparer la réponse réelle avec ce que votre code attend.

---

## 13. Passer en production (checklist)

- [ ] Compte marchand validé (KYC accepté).
- [ ] Clés `sk_live_...` / `pk_live_...` configurées dans le gestionnaire de secrets de l'hébergeur, jamais dans le code.
- [ ] `FEDAPAY_ENVIRONMENT=live` et bascule de l'URL vers `https://api.fedapay.com`.
- [ ] Webhook **live** créé (secret différent du sandbox) pointant vers l'URL de production en HTTPS.
- [ ] Événements du webhook restreints à ceux réellement traités.
- [ ] `NEXT_PUBLIC_SITE_URL` en production pour le `callback_url`.
- [ ] Aucune clé secrète dans un composant client (`'use client'`) ni dans une variable `NEXT_PUBLIC_`.
- [ ] RLS activée sur toutes les tables liées aux paiements, écriture réservée au `service_role`.
- [ ] Journalisation et alerting sur les échecs de webhook (sinon FedaPay désactive l'endpoint après 10 échecs).
- [ ] Tâche de réconciliation planifiée : pour chaque `payments` resté `pending` depuis plus d'une heure, interroger `GET /v1/transactions/{id}` et resynchroniser.
- [ ] Rotation périodique des clés API documentée, avec procédure ancienne clé → nouvelle clé.
- [ ] Premier paiement réel de faible montant testé de bout en bout.

Exemple de job de réconciliation (Route Handler appelé par un cron Vercel ou `pg_cron`) :

```ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { initFedaPay, Transaction } from '@/lib/fedapay';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== 'Bearer ' + process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();

  const { data: pendings } = await admin
    .from('payments')
    .select('id, fedapay_transaction_id')
    .eq('status', 'pending')
    .lt('created_at', oneHourAgo)
    .limit(100);

  initFedaPay();

  for (const p of pendings ?? []) {
    const tx: any = await Transaction.retrieve(p.fedapay_transaction_id);
    if (tx.status !== 'pending') {
      await admin.from('payments').update({ status: tx.status }).eq('id', p.id);
    }
  }

  return NextResponse.json({ checked: pendings?.length ?? 0 });
}
```

---

## 14. Erreurs fréquentes et bonnes pratiques

**Sécurité**
- Ne faites jamais confiance au paramètre `status` de l'URL de retour ni au `onComplete` du widget : vérifiez toujours côté serveur.
- Ne calculez jamais un montant depuis le navigateur.
- Vérifiez systématiquement la signature du webhook sur le **corps brut** (`await req.text()`) ; parser le JSON avant la vérification casse la signature.
- Ne mettez que des données non sensibles dans `custom_metadata` (jamais de mot de passe, de données de carte, ni de secret).
- Ne stockez ni numéro de carte ni donnée bancaire dans Supabase : FedaPay gère la collecte de ces données.

**Fonctionnel**
- `merchant_reference` doit être unique, sinon la création de transaction échoue.
- Un même email = un même client chez FedaPay ; les informations sont écrasées à chaque transaction.
- `canceled` et `declined` ne sont pas des états terminaux : proposez un bouton "réessayer" qui crée une nouvelle transaction.
- Ne rétrogradez jamais un paiement déjà `approved` à cause d'un événement reçu dans le désordre (d'où le `.neq('status', 'approved')`).
- Le montant est un entier : pas de `amount: 20.5` en XOF.

**Codes d'erreur de l'API**

| Code | Cause probable | Action |
|---|---|---|
| 400 | Paramètres mal formés | Vérifier le corps JSON et les types |
| 401 | Clé absente, invalide, ou test/live inversé | Vérifier `Authorization: Bearer` et l'environnement |
| 404 | Mauvaise URL ou ressource inexistante | Vérifier l'id et le préfixe `/v1` |
| 500 | Incident côté FedaPay | Réessayer, puis contacter le support |

**Next.js**
- `runtime = 'nodejs'` sur toutes les routes qui utilisent le SDK.
- `dynamic = 'force-dynamic'` sur les routes de paiement et la page de retour.
- Les composants qui chargent le widget doivent être des Client Components chargés sans SSR.
- Attention aux appels concurrents avec `FedaPay.setApiKey` (configuration globale au processus).

---

## 15. Annexes

### 15.1 Endpoints principaux

Base : `https://sandbox-api.fedapay.com/v1` (test) ou `https://api.fedapay.com/v1` (live).
En-têtes : `Authorization: Bearer VOTRE_CLE_SECRETE` et `Content-Type: application/json`.

| Méthode | Endpoint | Usage |
|---|---|---|
| POST | `/transactions` | Créer une collecte |
| POST | `/transactions/{id}/token` | Obtenir `{ token, url }` de paiement |
| GET | `/transactions/{id}` | Détails et statut d'une collecte |
| GET | `/transactions` | Rechercher / lister les collectes |
| PUT | `/transactions/{id}` | Mettre à jour une collecte |
| DELETE | `/transactions/{id}` | Supprimer une collecte |
| GET | `/transactions/merchant/{reference}` | Retrouver via votre référence |
| POST | `/{mode}` | Déclencher un paiement mobile sans redirection |
| POST | `/customers` | Créer un client |
| GET | `/customers/{id}` | Détails d'un client |
| PUT | `/customers/{id}` | Mettre à jour un client |
| DELETE | `/customers/{id}` | Supprimer un client |
| GET | `/events`, `/logs`, `/balances`, `/currencies` | Consultation |
| POST | `/payouts` + `/payouts/start` | Dépôts / versements sortants |

### 15.2 Statuts d'une collecte

| Statut | Signification |
|---|---|
| `pending` | Créée, en attente de paiement (expire après 24 h) |
| `approved` | Paiement réussi |
| `declined` | Interrompue par le client |
| `canceled` | Annulée (solde insuffisant, autre problème) |
| `refunded` | Remboursée au client |
| `transferred` | Fonds transférés vers le compte marchand |
| `expired` | Non finalisée dans le délai |

Un remboursement peut être initié depuis `approved` ou `transferred`.

### 15.3 Événements webhook

`transaction.created`, `transaction.updated`, `transaction.approved`, `transaction.declined`, `transaction.canceled`, `transaction.transferred`, `customer.created`, `customer.updated`, `customer.deleted`.

### 15.4 Méthodes de paiement par pays

| Pays | Avec redirection | Sans redirection |
|---|---|---|
| Bénin | MTN, Moov, Celtiis, BMO, Coris Money | MTN, Moov, Celtiis |
| Togo | Mixx by Yas, Moov | Moov, Mixx by Yas |
| Côte d'Ivoire | MTN | MTN |
| Niger | Airtel | Airtel |
| Sénégal | Free Sénégal | Free Sénégal |
| Toutes régions | Visa / Mastercard | — |

Les dépôts (payouts) sont disponibles au Bénin (MTN, Moov, Celtiis), au Togo (Mixx by Yas) et en Côte d'Ivoire (MTN), tous sans redirection.

### 15.5 Ordre de mise en œuvre conseillé

1. Créer le compte, récupérer les clés sandbox.
2. Créer la migration `payments` + `fedapay_events` dans Supabase et activer la RLS.
3. Écrire `lib/fedapay.ts` et la route `create-transaction`.
4. Brancher le bouton de paiement avec redirection ; vérifier qu'une ligne `pending` est créée.
5. Implémenter la page de retour avec vérification serveur.
6. Implémenter le webhook signé + idempotence ; tester avec un tunnel HTTPS.
7. Ajouter le job de réconciliation.
8. (Optionnel) Ajouter le widget embarqué et/ou le paiement mobile sans redirection.
9. Dérouler la matrice de tests, puis basculer en live.

---

### Sources

Documentation officielle FedaPay consultée sur `docs.fedapay.com` : Librairies, Authentification, Gestion des clés API, Gestion des clients, Gestion des collectes, Envoi de requêtes, Webhooks et Événements, SDKs Node.js et React.js, Méthodes de paiement, Référence API (transactions, customers, webhooks).

Les portions de code de ce document sont des exemples originaux adaptés à Next.js et Supabase ; référez-vous toujours à la référence API en ligne pour les schémas de requête à jour.
