# PopMarket OS — Food Truck Market Organizer

A full-stack operations platform for food truck markets and pop-up festivals. It connects platform admins, market organizers, vendors, and visitors through event management, applications, stall allocation, menus, RSVPs, payments, passes, and commission settlement.

**Live demo:** [https://popmarket-os.vercel.app](https://popmarket-os.vercel.app)

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, **Razorpay**, **React Hook Form**, and **Zod**.

## How the platform works

### 1. Platform admin

- Signs in separately at `/admin/login`
- Views organizers, events, published-market revenue, and platform commission
- Configures the platform fee percentage and platform availability
- Can disable new event creation and publishing with the platform switch
- Uses a dedicated superadmin account; organizer accounts cannot access `/admin`

### 2. Organizer

- Signs up for either the **Free RSVP plan** or **Paid RSVP plan**
- Accepts the current organizer terms during signup
- Creates an event as a draft and configures its venue, capacity, fees, cover image, and stall grid
- Previews draft public and vendor-application pages before publishing
- Publishes the market, reviews vendor applications, assigns stalls, tracks payments, and exports payout data
- Settles outstanding platform commission from `/dashboard/billing`

### 3. Vendor

1. Opens `/apply/[event-slug]` without creating an account
2. Submits business, cuisine, truck/stall, utility, menu, and preferred-stall details
3. Can upload a menu image for AI extraction or add menu items and dish photos manually
4. Receives a private status link at `/vendor/[token]`
5. Is approved, waitlisted, or rejected by the organizer
6. After approval, pays the stall fee and any premium-bay fee through Razorpay
7. Receives a QR-ready vendor pass after payment is paid/waived and a stall is assigned

### 4. RSVP guest

1. Opens the public market at `/e/[event-slug]`
2. Browses the vendor lineup, dish images, menu prices, floor plan, date, venue, and availability
3. Submits an RSVP with party size
4. Is confirmed when capacity is available or waitlisted when the market is full
5. Pays through Razorpay only when that event has a guest entry fee
6. Receives a private confirmation/pass page at `/rsvp/[token]`

Duplicate vendor email/business applications and duplicate RSVP emails are blocked per event.

## Plans and event pricing

The organizer's plan and an event's guest fee are separate settings.

| Capability | Free RSVP plan | Paid RSVP plan |
| ---------- | -------------- | -------------- |
| Published events | 1 at a time | Unlimited |
| Maximum stall grid | 15×15 | 30×30 |
| Free guest RSVPs | Yes | Yes |
| Paid guest entry | No | Optional |
| Vendor stall payments | Yes | Yes |

A **Paid RSVP plan** organizer can still publish a free-entry event by setting the guest RSVP fee to ₹0. Vendor stall fees can remain paid on the same event.

## Main features

### Organizer dashboard

- Event overview, share links, guest-entry status, and plan-aware limits
- Draft creation and publishing
- Cover-image upload and venue/address picker
- Vendor application review: approve, waitlist, reject with reason
- Searchable, sortable, filterable, paginated data tables
- Interactive stall designer and assignment map
- Standard and premium bays with optional premium fees
- Paid bays protected from accidental reassignment
- Manual vendor payment states: pending, paid, waived, or overdue
- Vendor terms per event
- Stall and RSVP payment history
- Payout/tax CSV with gross, platform fee, organizer net, and Razorpay IDs
- Organizer workflow guide at `/dashboard/guide`

### Public event experience

- Public page at `/e/[slug]`
- Cover hero, event stats, RSVP form, menu cards, dish images, cuisine filters, and floor plan
- First-visit welcome celebration and RSVP availability messaging
- “Coming soon” page until at least one approved vendor has public menu content
- Draft preview for the logged-in organizer; submissions remain disabled until publishing
- Focused public flows without dashboard navigation or unnecessary footer content

### Menu AI and images

- Menu extraction is available to vendors in the application form
- Upload limit: 5 MB per menu image
- Gemini is attempted first; Groq is used as a fallback for supported extraction failures
- Extracted names and prices remain editable before submission
- When the model returns image regions, the browser crops dish images from the uploaded menu
- Vendors can upload or replace each dish image manually
- Broken external images fall back to reliable generated food artwork
- Dish thumbnails open in an image preview dialog

AI extraction requires `GEMINI_API_KEY`, `GROQ_API_KEY`, or both.

### Billing and platform commission

- Default platform fee: **10%**, editable at `/admin/settings`
- Commission applies to paid vendor stalls and paid RSVP entry
- Each payment stores gross amount, platform fee, and organizer net
- Organizers collect customer payments and settle outstanding commission from **Dashboard → Billing**
- Commission settlements are tracked separately from customer payments
- Free RSVPs and waived vendor payments do not create a paid guest charge
- Public organizer terms are available at `/terms`

## Authentication and routes

| User | Entry point | Destination |
| ---- | ----------- | ----------- |
| Platform admin | `/admin/login` | `/admin` |
| Organizer | `/login` or `/signup` | `/dashboard` |
| Event visitor | `/e/[slug]` | Public event and RSVP |
| Vendor | `/apply/[slug]` | Application form |
| Vendor with token | `/vendor/[token]` | Status, payment, and pass |
| Guest with token | `/rsvp/[token]` | RSVP status, payment, and pass |

Platform admins cannot use the organizer dashboard, and organizers cannot access the platform console. Logged-in organizers may still open `/admin/login` to switch to a platform account.

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind CSS v4 |
| Forms | React Hook Form, Zod |
| Backend | Next.js Server Actions and Route Handlers |
| Database/Auth | Supabase Postgres, Auth, RLS, Storage |
| Payments | Razorpay |
| AI | Google Gemini with Groq fallback |
| Deployment | Vercel and Supabase Cloud |

## Project structure

```text
src/
├── app/
│   ├── (auth)/              # Organizer login and signup
│   ├── (dashboard)/         # Organizer dashboard
│   ├── (public)/            # Event, apply, vendor, RSVP, and terms pages
│   ├── admin/               # Platform login and console
│   └── api/                 # Menu extraction and payment APIs
├── components/
│   ├── features/            # Events, vendors, menus, stalls, payments
│   ├── forms/               # Validated interactive forms
│   ├── layout/              # Public, organizer, and admin shells
│   ├── marketing/           # Landing-page sections
│   └── ui/                  # Shared design-system components
├── lib/
│   ├── actions/             # Server actions
│   ├── ai/                  # Gemini and Groq extraction
│   ├── payments/            # Razorpay integration
│   ├── queries/             # Supabase data access
│   ├── supabase/            # Browser, server, and admin clients
│   └── validations/         # Zod schemas
└── types/                   # Shared TypeScript types

scripts/                     # Demo, showcase, load-test, and reset scripts
supabase/                    # Base schema, migrations, and storage setup
```

## Local setup

### 1. Install

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Signup, admin operations, previews, and seeds; server only |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` locally or the deployed URL |
| `SUPERADMIN_EMAILS` | Recommended | Comma-separated platform-admin emails |
| `RAZORPAY_KEY_ID` | For payments | Server-side Razorpay key |
| `RAZORPAY_KEY_SECRET` | For payments | Server-side Razorpay secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For payments | Browser Checkout key |
| `GEMINI_API_KEY` | Optional | Primary menu extraction provider |
| `GEMINI_MODEL` | Optional | Gemini model override |
| `GROQ_API_KEY` | Optional | Menu extraction fallback |
| `GROQ_MODEL` | Optional | Groq model override |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Venue/address autocomplete |

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` to browser code.

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL Editor.
3. Run the SQL files in `supabase/migrations/`.
4. Run `supabase/storage.sql` to create the event-cover storage bucket and policies.
5. In **Authentication → URL Configuration**, set:
   - Local site URL: `http://localhost:3000`
   - Local redirect URL: `http://localhost:3000/**`
   - Production site URL and redirect URL to the deployed domain
6. Set `SUPERADMIN_EMAILS` to platform-team addresses only.

Existing Supabase projects should apply any migration files they have not run yet.

### 4. Seed demo data

```bash
# Demo accounts only
npm run seed:dev

# Accounts + workflow matrix + rich public showcase
npm run seed:all

# Everything above plus load-test data
npm run seed:full

# Clear seeded data, then rebuild core demo fixtures
npm run reset:seed

# Clear data, then add bulk load-test fixtures
npm run reset:seed:large
```

Demo credentials:

| Account | Plan | Email | Password | Login |
| ------- | ---- | ----- | -------- | ----- |
| Organizer | Paid RSVP | `organizer@popmarket.dev` | `Demo@12345` | `/login` |
| Organizer | Free RSVP | `client2@popmarket.dev` | `Demo@12345` | `/login` |
| Platform admin | Platform | `platform@popmarket.dev` | `Admin@12345` | `/admin/login` |

Keep `SUPERADMIN_EMAILS=platform@popmarket.dev`; do not add organizer emails.

Key public demos after `npm run seed:all`:

- Paid guest RSVP: `/e/corporate-lunch-market`
- Free guest RSVP with 20 vendors, menu images, and 25 stalls: `/e/community-picnic-free`
- Vendor application: `/apply/corporate-lunch-market`
- Additional private vendor and RSVP token URLs are printed by the seed scripts

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Apply supported ESLint fixes |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run seed:dev` | Create paid organizer, free organizer, and platform-admin accounts |
| `npm run seed:demo` | Add core events, vendors, RSVPs, stalls, and payments |
| `npm run seed:matrix` | Add fixtures covering billing, admin, free RSVP, and menu-image flows |
| `npm run seed:showcase` | Add the rich public picnic showcase |
| `npm run seed:large` | Add bulk vendors, RSVPs, and payments for table/load testing |
| `npm run seed:all` | Run dev, demo, matrix, and showcase seeds |
| `npm run seed:full` | Run all seeds, including the large dataset |
| `npm run reset:dev` | Remove seeded app data |
| `npm run reset:seed` | Reset, then run dev, demo, and matrix seeds |
| `npm run reset:seed:large` | Reset, then run dev, demo, matrix, and large seeds |
| `npm run reset:seed:full` | Alias of `reset:seed:large` |

## Deployment

1. Push the repository to GitHub and import it into Vercel, or run:

```bash
npx vercel --prod
```

2. Add the `.env.example` variables under **Vercel → Project → Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_APP_URL` to the production domain.
4. Add the production domain to Supabase Auth site and redirect URLs.
5. Confirm the Supabase schema, migrations, and storage policies are applied.
6. Redeploy after changing environment variables.

```text
Browser → Vercel / Next.js → Supabase Auth, Postgres, RLS, Storage
                          ├→ Razorpay
                          └→ Gemini → Groq fallback
```

## Design system

| Token | Value | Use |
| ----- | ----- | --- |
| Primary | `#E85D04` | Burnt-orange calls to action |
| Secondary | `#2D6A4F` | Forest-green trust and success states |
| Accent | `#F4A261` | Warm highlights |
| Background | `#FFFBF7` | Cream page background |

## License

MIT
