# Photo Log

A map-based photo journal. Pin your photos to the places you took them, browse your posts on an interactive map, and revisit them through a paginated feed.

**[Live Demo](https://photo-log-alpha.vercel.app/)** - Click "Try the demo" to explore without creating the account.

## Tech Stack

- Next.js (App Router)
- Supabase (Postgres, Auth, Storage, Row Level Security)
- Zustand
- Mapbox GL
- Tailwind CSS
- Vitest

## How to Start

```bash
git clone https://github.com/seneyu/photo-log.git
cd photo-log
npm install
```

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_SECRET=
NEXT_PUBLIC_MAPBOX_TOKEN=
DEMO_ACCOUNT_EMAIL=
DEMO_ACCOUNT_PASSWORD=
```

Run the Supabase schema (`supabase/schema.sql`) against your own Supabase project, then:

```bash
npm run dev
```

## Data Model

<img src="assets/schema.png" alt="Photo Log ER diagram" width="600">
