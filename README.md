# Reinita Larue — narration site

Production-ready Next.js scaffold for [reinitalarue.com](https://reinitalarue.com).

Same stack as the reference site (Next.js 16, Supabase, Cloudflare R2, Resend, Vercel) but stripped to the essentials — no production board, no PDF pipeline, no Microsoft 365 OAuth. Add those later when she actually needs them.

## What's in here

```
app/
  page.tsx              — homepage (hero, intro, genres, dark "Listen" section, CTA)
  about/page.tsx        — fuller bio, gear, quick-facts grid
  demos/page.tsx        — Supabase-backed demo grid with elegant empty state
  contact/page.tsx      — inquiry form + direct email
  api/
    contact/route.ts    — validates → Supabase insert → Resend email
    newsletter/route.ts — Supabase insert + optional Buttondown sync
  globals.css           — design tokens (the ocean palette + Fraunces/Manrope)
  layout.tsx            — root layout, fonts, nav + footer

components/
  nav.tsx               — mobile-aware top nav
  footer.tsx            — dark navy footer w/ socials
  wave-divider.tsx      — the signature wave line between sections
  demo-card.tsx         — audio player card (works in light or dark variant)
  contact-form.tsx      — inquiry form with honeypot
  newsletter-form.tsx   — single-input subscribe

lib/
  supabase.ts           — browser, server, and service-role clients
  resend.ts             — Resend wrapper
  r2.ts                 — R2/S3 client with the gotchas baked in

supabase/
  schema.sql            — initial tables (demos, inquiries, newsletter_subscribers)
```

## Design choices, on purpose

- **Type:** Fraunces (display, variable, soft serifs) + Manrope (body). Avoids the overused Playfair/Cormorant + Inter pairing.
- **Palette:** ocean — `--color-abyss` (deep navy) for ink, `--color-tide` (teal) and `--color-kelp` (sea green) for accents, `--color-shore` (warm sand) as the page background. Cream is the *paper*, not the accent.
- **Signature section:** the "Listen" block on the homepage is dark navy. It's the page's one bold gesture; everything else stays quiet so this lands.
- **Wave divider:** thin sea-green SVG used sparingly between sections.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev
```

### Required env vars to ship

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database reads (demos) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes (inquiries, newsletter) |
| `RESEND_API_KEY` | Contact form email |
| `RESEND_FROM_EMAIL` | e.g. `hello@reinitalarue.com` (must be a verified Resend domain) |
| `CONTACT_INBOX_EMAIL` | Where inquiries go — `rlnarration@gmail.com` |

### Optional

| Variable | Purpose |
|---|---|
| `R2_*` | Demo audio hosting on Cloudflare R2 |
| `BUTTONDOWN_API_KEY` | Newsletter list management |

### Supabase setup

1. Create a new Supabase project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy the URL + anon key + service-role key into `.env.local`.

### R2 setup (when she's ready for demos)

1. Create a bucket called `reinita-demos` in Cloudflare R2.
2. Enable public access via the `pub-*.r2.dev` URL or a custom domain.
3. Create an API token with R2 Edit permissions.
4. **Important — the two R2 gotchas (you already know them):**
   - Presigned PUTs must not include `Content-Type` in signed headers.
   - Use `requestChecksumCalculation: "WHEN_REQUIRED"` on the S3Client (already set in `lib/r2.ts`).

### Adding demos

Insert into the `demos` table directly via the Supabase dashboard for now:

```sql
insert into demos (title, genre, character, description, audio_url, published)
values (
  'Sample title',
  'Romance',
  'Adult female, contemporary, warm',
  'A first-meet scene from a small-town romance…',
  'https://pub-XXX.r2.dev/demos/sample.mp3',
  true
);
```

A proper admin UI for this can come later — for v1, hand-managing 5–10 demos in the dashboard is faster than building a CMS.

## Replace before launch

- `public/portrait-placeholder.jpg` — Reinita's actual portrait
- The `[city]` placeholder in the hero copy on `app/page.tsx`
- The `[Paragraph 2]` placeholder in `app/about/page.tsx`
- Open Graph / Twitter card image (drop a `public/og.jpg` and reference in `app/layout.tsx`)
- Favicon and apple-touch-icon in `public/`
- Final logo wherever the wordmark currently sits

## Deploy

```bash
vercel link
vercel env pull .env.local   # or set them in the Vercel dashboard
vercel deploy --prod
```

Add the production domain in Vercel and update `RESEND_FROM_EMAIL` to use a verified subdomain (e.g. `hello@reinitalarue.com`).
