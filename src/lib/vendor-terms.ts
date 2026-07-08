/** Default vendor T&C — copied to new events; organizers can customize per event */

export const DEFAULT_VENDOR_TERMS = `## 1. Agreement to participate

By submitting this application, you ("Vendor") agree to participate in the food truck market ("Event") organized by the event host, subject to these Terms & Conditions. Approval is at the sole discretion of the Organizer.

## 2. Stall fee, RSVP entry fees & payment tracking

- The base stall fee and any premium bay surcharge quoted during application are payable only after your application is **approved**.
- Payment must be completed within the deadline communicated by the Organizer via Razorpay. Failure to pay may result in forfeiture of your assigned bay.
- All vendor stall payments and guest RSVP entry fees (if applicable) are processed through Razorpay. The Organizer can view payment status, amounts, and transaction references in the event dashboard.
- **Refunds:** If the Organizer cancels or deletes the event, paid stall fees and RSVP entry fees will be refunded via Razorpay where technically possible. Processing time depends on your bank or card issuer (typically 5–7 business days). Stall fees are otherwise non-refundable except where the Event is cancelled by the Organizer or as required by applicable law.

## 3. Licences, permits & food safety

You warrant that you hold all valid licences required to operate a food business in India, including but not limited to FSSAI registration/licence, local trade licence, and fire safety clearance where applicable. You will produce copies upon request and comply with all food safety, hygiene, and municipal regulations.

## 4. Setup, operations & breakdown

- Arrive and complete setup no later than the **vendor setup time** specified for the Event.
- Operate only within your assigned bay. Do not block aisles, emergency exits, or neighbouring stalls.
- Maintain cleanliness of your bay and immediate surroundings. Remove all waste and complete breakdown within the time window given by the Organizer.

## 5. Power, water & equipment

Power and water connections, where offered, are shared resources. You are responsible for your own cables, adapters, and equipment. The Organizer is not liable for power interruptions. Do not overload circuits or use open flames except where pre-approved.

## 6. Menu, pricing & conduct

- Menu items and prices submitted in your application must be honoured on event day unless prior written approval is obtained.
- Staff must be courteous to guests and other vendors. Harassment, discrimination, or intoxication will result in immediate removal.
- Alcohol service is permitted only where you hold the appropriate licence and the Organizer has given written consent.

## 7. Insurance & liability

You participate at your own risk. You agree to indemnify the Organizer against claims arising from your operations, food products, equipment, or staff. The Organizer is not responsible for theft, damage, or loss of your property.

## 8. Cancellation & no-shows

If you cannot attend, notify the Organizer immediately. No-shows without reasonable notice may affect eligibility for future events. The Organizer may reassign your bay if you are more than 30 minutes late after the published setup time without prior notice.

## 9. Photography & marketing

The Organizer may photograph or film the Event for promotional purposes. By participating, you grant a non-exclusive licence to use images of your stall, branding, and food for Event-related marketing.

## 10. Acceptance

Checking "I agree" on the application form constitutes your electronic acceptance of these terms. The Organizer may update terms before publication; the version displayed on the application page at the time of submission applies.`;

export function resolveVendorTerms(terms: string | null | undefined): string {
  const trimmed = terms?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_VENDOR_TERMS;
}

export interface TermsSection {
  title: string;
  body: string;
}

/** Parse ## headings into sections for display */
export function parseVendorTermsSections(terms: string): TermsSection[] {
  const chunks = terms.split(/^## /m).filter(Boolean);
  if (chunks.length === 0) {
    return [{ title: 'Terms & Conditions', body: terms.trim() }];
  }

  return chunks.map((chunk) => {
    const newline = chunk.indexOf('\n');
    if (newline === -1) {
      return { title: chunk.trim(), body: '' };
    }
    return {
      title: chunk.slice(0, newline).trim(),
      body: chunk.slice(newline + 1).trim(),
    };
  });
}
