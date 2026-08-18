# AutomationKits Next.js V1

Produktive Next.js-Version nach Claude-Vorgabe.

## Enthalten
- Next.js App Router + TypeScript
- Supabase SSR Auth / Magic Link
- Supabase/Postgres als SSOT
- internes Command Center
- echte Customers / Payments / Onboarding / Roadmap / Tasks / Blockers / Activity
- Schreiboperationen für Task-, Roadmap- und Portalstatus
- Customer Detail + Onboarding Write
- Kundenportal mit echten RLS-Daten
- aktueller HTML-Prototyp bleibt nur visuelle Referenz

## Start lokal
1. `.env.example` nach `.env.local` kopieren
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` setzen
3. `npm install`
4. `npm run dev`

## Auth
Für lokal und Produktion müssen Supabase Auth Redirect URLs enthalten:
- `http://localhost:3000/auth/callback`
- `https://app.automationkits.de/auth/callback`

## Deployment Donnerstag
Codex/Vercel:
- Repo verbinden
- Env Vars setzen
- `app.automationkits.de` verbinden
- Supabase Site URL + Redirect URL setzen
- SMTP verbinden
