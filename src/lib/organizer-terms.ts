import { parseVendorTermsSections } from '@/lib/vendor-terms';

export const ORGANIZER_TERMS_VERSION = '2026-07-1';

/** Build organizer platform T&Cs with the live commission percent. */
export function buildOrganizerTerms(feePercent: number): string {
  const pct = Number.isFinite(feePercent) ? feePercent : 10;

  return `## 1. Who we are

PopMarket OS ("Platform", "we", "us") is operated by the PopMarket platform team (Superadmin). You ("Organizer", "Client") are an independent market organizer using our software to run food truck / pop-up events. Superadmin and Organizer are separate roles — we operate the Platform; you operate your markets and serve your own vendors and guests.

## 2. Platform commission

- PopMarket charges a platform commission of **${pct}%** on every paid **vendor stall fee** (including premium bay surcharges) and every paid **guest RSVP entry fee** collected through the Platform.
- Vendors and guests pay the full listed amount for stalls / tickets. You collect that revenue for your market. The commission is an amount **you owe PopMarket** and settle separately via the Organizer Billing page.
- The current rate is shown at signup and in Platform settings. We may update the rate with notice; new events use the rate in effect when fees are recorded.
- Razorpay (or other payment processors) may charge their own gateway fees in addition to our commission.

## 3. Settling commission

- Accrued commission appears under **Dashboard → Billing** as "Platform fees due".
- You agree to pay outstanding commission via Razorpay to PopMarket's platform account when due.
- Unpaid commission may limit publishing new events or other Platform features until settled.
- Settlement receipts (Razorpay payment / order IDs) are stored for your accounting and ours.

## 4. Your responsibilities

- You are responsible for your events, vendor relationships, guest communications, licences, and local compliance.
- Vendors and RSVP guests are **your** customers — not PopMarket's. Token-based vendor/RSVP links do not create Platform accounts for them.
- You will keep accurate fee settings (stall fee, RSVP entry fee) and honour published terms to vendors.

## 5. Account & access

- Organizer accounts use \`/login\` and \`/dashboard\`. Platform Superadmin uses a separate \`/admin\` portal. Do not share Superadmin credentials with organizers.
- You must accept these Terms to create an Organizer account. We may suspend accounts that violate these Terms or fail to settle commission.

## 6. Limitation of liability

The Platform is provided as-is for market operations tooling. PopMarket is not liable for event cancellations, vendor no-shows, food safety incidents, or disputes between you and your vendors/guests, except where required by applicable law.

## 7. Contact

Questions about commission, settlements, or these Terms: contact the PopMarket platform team through your account support channel.
`;
}

export function parseOrganizerTermsSections(terms: string) {
  return parseVendorTermsSections(terms);
}
