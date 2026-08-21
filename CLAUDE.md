# Photo Log

A geotag photo sharing application built as a full-stack MVP across four development phases. The project demonstrates a production-grade serverless architecture using Next.js 14 App Router, Supabase, and Mapbox — with a focus on real-time data, RLS-enforced data access, and a polished split-view map interface.

---

## 1. Build & Development Commands

```bash
npm run dev       # start development server
npm run build     # production build
npm run lint      # eslint
npx supabase gen types typescript --project-id <id> > lib/database.types.ts  # regenerate DB types
```

---

## 2. Architecture & Stack

| Layer      | Tool                      | Role                                            |
| ---------- | ------------------------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router)   | Server components, server actions, proxy        |
| Database   | Supabase PostgreSQL       | Primary data store with RLS enforcement         |
| Auth       | Supabase Auth             | Email/password + GitHub OAuth                   |
| Storage    | Supabase Storage          | Photo uploads, CDN delivery                     |
| Realtime   | Supabase Realtime         | WebSocket subscriptions for live comments       |
| Map        | Mapbox via `react-map-gl` | WebGL map rendering, geocoding API              |
| State      | Zustand                   | Shared `activePinId` (map marker → feed scroll) |
| UI         | shadcn/ui + Tailwind CSS  | Component library, utility-first styling        |
| Deployment | Vercel                    | Serverless, preview deployments per branch      |

**Supabase clients:**

- Browser: `lib/supabase/client.ts` → `createBrowserClient`
- Server: `lib/supabase/server.ts` → `createServerClient` (from `@supabase/ssr`)
- Use `@supabase/ssr` exclusively — not the deprecated `@supabase/auth-helpers-nextjs`

**Database tables:** `profiles`, `pins`, `follows`, `comments` — RLS enabled on all. Full schema in `supabase/schema.sql`.

---

## 3. Coding Conventions & Data Flow

**Component model:**

- Server Components for all initial data fetching
- Client Components only when required: map rendering, Zustand consumers, Supabase Realtime subscriptions
- Server Actions for all mutations — create pin, follow/unfollow, post comment

**TypeScript:**

- DB types are auto-generated from the Supabase schema: `lib/database.types.ts`
- Never hand-write types for database shapes — regenerate after any schema change

**Data flow — map → feed sync:**

- `activePinId` lives in Zustand
- Clicking a map pin: sets `activePinId` → feed scrolls to matching card
- Both panels subscribe to the same store — no prop drilling, no context

**Mutations follow this pattern:**

1. Client calls a Server Action
2. Server Action writes to Supabase (authenticated via `createServerClient`)
3. Realtime subscription on the client reflects the change live (comments only)
4. Map/feed re-fetches or updates optimistically depending on the mutation

---

## 4. System Design Decisions (Immutable Guardrails)

**Do not revisit these without strong justification.**

**Split-view layout is fixed.**
Map occupies 60% left, scrollable feed 40% right. Mobile uses a tab toggle. Clicking a map pin scrolls the feed to the matching card (map → feed sync) — do not collapse into a single-panel view.

**Location is required on every pin.**
`lat` and `lng` are `NOT NULL`. A pin without coordinates cannot appear on the map. The user sets location via a Mapbox Geocoding search, which returns `{ lat, lng, location_name }`. The Post button is disabled until coordinates are set. Do not make location optional — it breaks the map and feed filter logic.

**All mutations go through Server Actions.**
No direct Supabase writes from Client Components. Server Actions run in a trusted server context where the session is validated and RLS is enforced server-side before the query executes.

**RLS is the security boundary — not the application layer.**
Every table has RLS enabled. Policies enforce ownership at the database level. Application-layer checks (e.g. disabling a button) are UX convenience only — the DB will reject unauthorized writes regardless.

**@supabase/ssr only.**
The old `@supabase/auth-helpers-nextjs` package is deprecated and does not support the App Router session model correctly. Using it will cause auth bugs on server components and middleware.

**`proxy.ts`, not `middleware.ts`.**
Next.js 16 deprecated `middleware.ts`. The request interceptor lives in `proxy.ts` at the project root and exports an async function named `proxy`. Never rename it to `middleware.ts` or suggest doing so.
