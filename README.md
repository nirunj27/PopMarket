# PopMarket OS — Food Truck Market Organizer

A full-stack operations platform for food truck markets and pop-up festivals: vendor applications, stall maps, visitor RSVPs, Razorpay payments, AI menu extraction, and organizer dashboards.

**Live demo:** [https://popmarket-os.vercel.app](https://popmarket-os.vercel.app)

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, **Razorpay**, **React Hook Form**, and **Zod**.

## Features

### Superadmin (platform)
- Separate login at `/admin/login`
- Commission %, cities, Razorpay keys, organizer roles
- Cross-organizer event and revenue overview

### Organizer (your clients)
- Dashboard with event stats and upcoming markets
- Create / publish / manage food truck events
- Vendor application review (approve / waitlist / reject)
- Interactive stall map with bay assignment
- Payment tracking (Razorpay stall fees & RSVP tickets)
- Per-event **payout & tax CSV** (gross, platform fee, organizer net, Razorpay IDs)
- Vendor terms & conditions per event
- AI menu extraction from uploaded menus (names, prices, and dish photos)

### Vendors & RSVP guests (organizer's customers)
- Public event page with featured trucks and floor plan
- Vendor application form (cuisine, truck specs, power/water needs)
- Visitor RSVP with capacity limits and waitlist
- Token-based vendor status and RSVP confirmation pages
- QR-ready confirmation passes

### Platform engineering
- Supabase Auth + Row Level Security (RLS)
- Security headers (CSP, HSTS, X-Frame-Options)
- Form validation with Zod + React Hook Form
- Responsive food-market design system
- ESLint + Prettier

## Tech stack

| Layer | Tech |
| ----- | ---- |
| Frontend | Next.js App Router, React 19, Tailwind CSS v4 |
| Backend | Next.js Server Actions + Route Handlers |
| Database / Auth | Supabase (Postgres, Auth, RLS, Storage) |
| Payments | Razorpay |
| AI | Google Gemini / Groq (menu extraction) |
| Deploy | Vercel + Supabase Cloud |

## Project structure

```
src/
├── app/
│   ├── (auth)/              # Organizer login & signup
│   ├── admin/               # Superadmin login + console
│   ├── (dashboard)/         # Organizer dashboard
│   ├── (public)/            # Event, apply, vendor, RSVP pages
│   ├── api/                 # API routes (e.g. menu extraction)
│   ├── layout.tsx
│   └── page.tsx             # Marketing landing page
├── components/
│   ├── ui/                  # Design system primitives
│   ├── layout/              # Shells, headers, sidebar
│   ├── forms/               # Validated forms
│   ├── features/            # Events, stalls, applications, payments
│   ├── marketing/           # Landing sections
│   └── public/              # Public portal UI
├── lib/
│   ├── actions/             # Server actions
│   ├── queries/             # Data fetching
│   ├── validations/         # Zod schemas
│   ├── supabase/            # Browser / server / admin clients
│   ├── payments/            # Razorpay helpers
│   ├── ai/                  # Gemini / Groq
│   └── constants/           # App constants
├── types/                   # Shared TypeScript types
scripts/                     # Seed & reset scripts
supabase/                    # SQL schema (RLS policies)
```

## Getting started

### 1. Install dependencies

```bash
cd popmarket-os
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role (server only — never expose to client) |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` locally; production URL on Vercel |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret (server only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional | Razorpay key for Checkout |
| `RESEND_API_KEY` | Optional | Resend API key for emails |
| `EMAIL_FROM` | Optional | Sender, e.g. `PopMarket <onboarding@resend.dev>` |
| `GEMINI_API_KEY` | Optional | Google Gemini for menu extraction |
| `GROQ_API_KEY` | Optional | Groq fallback for menu extraction |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Venue / maps picker |

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. **Authentication → URL Configuration**
   - Local: Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**`
   - Production: Site URL `https://popmarket-os.vercel.app`, Redirect URLs `https://popmarket-os.vercel.app/**`
4. For local testing without SMTP: **Providers → Email → Confirm email → Off**

### 4. Seed demo data (optional)

Credentials are printed in the terminal only — login pages stay clean.

```bash
# Accounts only (organizer + superadmin)
npm run seed:dev

# Accounts + sample markets / vendors / RSVPs
npm run seed:all

# Full wipe + seed + large load-test dataset
npm run reset:seed:large
```

| Role | Portal | Email | Password |
| ---- | ------ | ----- | -------- |
| Organizer | `/login` | `organizer@popmarket.dev` | `Demo@12345` |
| Superadmin | `/admin/login` | `platform@popmarket.dev` | `Admin@12345` |

Keep `SUPERADMIN_EMAILS=platform@popmarket.dev` (not the organizer email).

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript check |
| `npm run seed:dev` | Create demo organizer + superadmin |
| `npm run seed:demo` | Seed sample market data |
| `npm run seed:all` | Seed users + demo data |
| `npm run seed:large` | Bulk vendors/RSVPs/payments for load testing |
| `npm run reset:dev` | Clear seeded app data |
| `npm run reset:seed` | Reset + seed users + demo data |
| `npm run reset:seed:large` | Reset + demo + large dataset |

## Platform revenue (superadmin)

### Who logs in where

| Role | Portal | URL |
| ---- | ------ | --- |
| **Superadmin** (platform team) | Platform console only | `/admin/login` → `/admin` |
| **Organizer** (your clients) | Market dashboard + Billing | `/login` → `/dashboard` |
| **Vendors & RSVP guests** | Token links (no account) | `/apply/[slug]`, `/vendor/[token]`, `/rsvp/[token]` |

These roles do **not** share dashboards. Superadmins cannot open `/dashboard`; organizers cannot open `/admin`.

Organizers accept **Terms** at signup (live platform % on stall + RSVP fees) and settle commission at **Dashboard → Billing**.

- Default platform fee: **10%** (editable in `/admin/settings`)
- Public terms: `/terms`
- Demo: keep `SUPERADMIN_EMAILS` on a **platform** email, not your organizer clients

Run `supabase/migrations/add-platform-admin.sql` and `add-commission-settlements.sql` in Supabase.

## Menu images

Vendors can attach a **dish photo** per menu item. **AI Extract** reads a menu card and pulls names, prices, and dish photos when the card includes food images (cropped from the upload). You can still replace any Pic manually. Images are stored with the menu item JSON.

The app is deployed at **[https://popmarket-os.vercel.app](https://popmarket-os.vercel.app)**.

### Deploy / update

1. Push to GitHub or run:

```bash
npx vercel --prod
```

2. Set the same env vars from `.env.example` in **Vercel → Project → Settings → Environment Variables**
3. Set `NEXT_PUBLIC_APP_URL=https://popmarket-os.vercel.app`
4. Update Supabase Auth Site URL + Redirect URLs to the production domain
5. Redeploy after adding env vars so the build picks them up

### Architecture

```
Browser → Vercel (Next.js) → Supabase (Auth, Postgres, RLS)
                          → Razorpay /Gemini (optional)
```

## Color palette

| Token | Hex | Usage |
| ----- | --- | ----- |
| Primary | `#E85D04` | Burnt orange — CTAs, energy |
| Secondary | `#2D6A4F` | Forest green — trust, freshness |
| Accent | `#F4A261` | Golden mustard — highlights |
| Background | `#FFFBF7` | Warm cream — page background |

## License

MIT
