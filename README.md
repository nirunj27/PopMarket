# PopMarket OS — Food Truck Market Organizer

A full-stack web app for organizing food truck markets: vendor applications, interactive stall maps, visitor RSVPs, and payment tracking.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, **React Hook Form**, and **Zod**.

## Features

- Organizer dashboard with event management
- Vendor application forms (public, no account required)
- Application review workflow (approve / waitlist / reject)
- Interactive stall map grid with vendor assignment
- Public event pages with featured trucks
- Visitor RSVP with capacity limits and waitlist
- Token-based vendor & RSVP status pages
- Row Level Security (RLS) on all Supabase tables
- Security headers (CSP, HSTS, X-Frame-Options)
- Form validation with Zod + React Hook Form
- Responsive design with food-market color palette
- ESLint + Prettier configured

## Project structure

```
src/
├── app/
│   ├── (auth)/           # Login & signup
│   ├── (dashboard)/      # Organizer dashboard
│   ├── (public)/         # Public event, apply, vendor, RSVP pages
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Design system primitives
│   ├── layout/           # Header, sidebar, page header
│   ├── forms/            # Validated forms
│   ├── features/         # Domain components (stalls, applications)
│   └── marketing/        # Landing page sections
├── lib/
│   ├── actions/          # Server actions
│   ├── queries/          # Data fetching
│   ├── validations/      # Zod schemas
│   ├── supabase/         # Supabase clients
│   └── constants/        # App constants
└── types/                # TypeScript types
```

## Getting started

### 1. Install dependencies

```bash
cd popmarket-os
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy `.env.example` to `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. In Supabase Auth settings, add `http://localhost:3000/**` to redirect URLs

### 3. Seed demo login (optional)

Create a pre-confirmed organizer account for local testing:

```bash
npm run seed:dev
```

**Demo credentials:**

| Field | Value |
|-------|-------|
| Email | `organizer@popmarket.dev` |
| Password | `Demo@12345` |

Sign in at [http://localhost:3000/login](http://localhost:3000/login)

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command             | Description          |
| ------------------- | -------------------- |
| `npm run dev`       | Start dev server     |
| `npm run build`     | Production build     |
| `npm run lint`      | Run ESLint           |
| `npm run lint:fix`  | Fix ESLint issues    |
| `npm run format`    | Format with Prettier |
| `npm run typecheck` | TypeScript check     |

## Deploy

- **Frontend:** [Vercel](https://vercel.com) — connect GitHub repo, add env vars
- **Backend:** Supabase Cloud (already hosted)
- Add production URL to Supabase Auth redirect URLs

## Color palette

| Token      | Hex       | Usage                           |
| ---------- | --------- | ------------------------------- |
| Primary    | `#E85D04` | Burnt orange — CTAs, energy     |
| Secondary  | `#2D6A4F` | Forest green — trust, freshness |
| Accent     | `#F4A261` | Golden mustard — highlights     |
| Background | `#FFFBF7` | Warm cream — page background    |

## License

MIT
