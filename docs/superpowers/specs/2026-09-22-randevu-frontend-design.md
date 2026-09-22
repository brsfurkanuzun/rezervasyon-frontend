# Randevu Frontend Design

**Date:** 2026-09-22  
**Scope:** Customer marketplace + basic provider panel  
**Stack:** Vite · React · TypeScript · React Router · Tailwind · React Query · Zustand

## Product decisions

| Topic | Choice |
|-------|--------|
| Surfaces | Customer app + basic provider panel |
| Locale | Turkish UI |
| Visual | Fresha-inspired hybrid: lilac mist + black CTA + characterful sans (not Inter, not purple SaaS clone) |
| Architecture | Feature-based SPA |
| Map | Deferred (no map in v1) |
| API | `http://localhost:8080` (`VITE_API_URL`) |

## Visual system

- Background: soft lilac → white (`#F3EEF8` → `#FFFFFF`)
- Text: `#111`; muted `#6B7280`
- Primary CTA: near-black pill/button
- Search card: white surface + soft lilac glow ring
- Display font: Sora or Outfit; body: DM Sans
- Wordmark: lowercase **randevu**
- Signature motif: lilac glow on search; venue cards with image, heart, star rating

Forbidden: Inter default, purple-indigo SaaS gradients, cream+terracotta editorial, heavy glassmorphism.

## Routes

### Customer
- `/` — discover: hero search (service · city · date), category chips, carousels / grid of venues
- `/ara` — search results with filters + date strip
- `/isletmeler/:slug` — venue detail (services, employees, reviews, book CTA)
- `/isletmeler/:slug/randevu` — booking wizard: service → employee → date/slots → confirm
- `/giris`, `/kayit`
- `/hesabim/randevular`, `/hesabim/favoriler`

### Provider
- `/panel` — today’s appointments summary
- `/panel/isletmeler` — list + create
- `/panel/isletmeler/:id` — edit business, services, employees, working hours, appointments lifecycle

## API mapping

| UI | Backend |
|----|---------|
| Search / list | `GET /api/v1/businesses` |
| Detail | `GET /api/v1/businesses/{slug}` |
| Categories | `GET /api/v1/categories` |
| Availability | `GET /api/v1/businesses/{id}/availability` |
| Book / cancel / my | appointments |
| Favorites | `/api/v1/favorites` |
| Reviews | `/api/v1/reviews` |
| Auth | `/api/v1/auth/*` |
| Provider CRUD | businesses, employees, services, working-hours, appointments confirm/complete |

## Folder structure

```
src/
  app/          # router, providers, layout
  features/     # auth, explore, venue, booking, account, provider
  shared/       # ui, api client, hooks, types
  styles/
```

## Auth

- Access + refresh tokens in memory / localStorage (refresh persisted)
- Axios/fetch interceptor: attach Bearer, refresh on 401
- Route guards by role (`CUSTOMER`, `PROVIDER`)

## Out of scope (v1)

- Map view
- Expert profiles as separate search tab
- Payments
- Native app parity (push, deep links)
