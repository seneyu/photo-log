# Photo Log — Todo List

## Phase 1 — Foundation & Authentication

- [x] Next.js 14 project setup with TypeScript, Tailwind CSS, and App Router
- [x] Supabase PostgreSQL schema with RLS policies on all tables (`supabase/schema.sql`)
- [x] Email/password and GitHub OAuth via Supabase Auth
- [x] Route protection and session management via middleware and `@supabase/ssr`

## Phase 2 — Core Map Experience & Uploads

- [x] Responsive split-view layout — Mapbox map (60%) alongside public feed (40%)
- [x] Photo upload with manual Mapbox Geocoding text search autocomplete lookup
- [x] Fast client-side pin rendering with Mapbox default marker styles
- [x] `createPin` Server Action to handle file storage uploads and database row writes

## Phase 3 — Interface Sync & Comments

- [x] Zustand store for `activePinId` — clicking a map marker scrolls the feed card into view
- [x] Dynamic slide-out drawers showing high-res media and comments
- [x] `createComment` Server Action - insert + return joined row, optimistic append

## Phase 4 — Polish & Deployment

- [x] `updatePin` and `deletePin` Server Actions for MVP
- [x] Empty state UI components and mobile-responsive layout adjustments
- [x] Client-side compression before image upload
- [x] Final deployment on Vercel connected to your production Supabase database instance

**MVP done when:** the app is live at a real URL, a fresh visitor can sign up, drop a pin with a photo, see it on the map, open it, and comment with no broken empty/loading states along the way.

## Phase 5 - Performance & Testing

- [x] Infinite scroll for feed panel to reduce initial page load
- [ ] Testing and CI

---

## Post-MVP / Stretch

- [ ] User search bar → profile pages showing a grid of their photo contributions
- [ ] Follow/unfollow system with follower counts on profiles
- [ ] "Following" filter on feed and map (marker color distinguishes yours vs. theirs)
