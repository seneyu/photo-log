# Photo Hub — Todo List

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

## Phase 3 — Social Interactions & Interface Sync

- [x] Zustand store for `activePinId` — clicking a map marker scrolls the feed card into view
- [ ] Dynamic slide-out drawers showing high-res media and comments
- [ ] Comment threads powered by Supabase Realtime WebSocket subscriptions for live feedback
- [ ] Follow/unfollow system with "Following" feed filter and follower counts on profiles
- [ ] User profile pages showing a grid of their specific photo contributions

## Phase 4 — Optimization & Deployment

- [ ] Loading skeletons, empty state UI components, and mobile-responsive layout adjustments
- [ ] Next.js image optimization using native Supabase Storage URL resizing parameters
- [ ] Final deployment on Vercel connected to your production Supabase database instance
