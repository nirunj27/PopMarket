import { formatCurrency, formatDate } from '@/lib/utils';

export interface RsvpEmailData {
  guestName: string;
  partySize: number;
  status: 'confirmed' | 'waitlisted';
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  startTime: string;
  endTime?: string;
  setupTime?: string;
  description?: string;
  confirmationUrl: string;
}

export interface VendorEmailData {
  businessName: string;
  ownerName: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'rejected';
  eventTitle: string;
  eventDate: string;
  venueName: string;
  city: string;
  stallFee?: number;
  premiumFee?: number;
  preferredStallCode?: string;
  assignedStallCode?: string;
  rejectionReason?: string;
  statusUrl: string;
  paymentUrl?: string;
}

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fffbf7;font-family:Inter,Segoe UI,sans-serif;color:#1c1917;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e7e0d8;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#e85d04;padding:20px 24px;">
          <div style="font-size:18px;font-weight:800;color:#fff;">PopMarket</div>
          <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Food Truck OS</div>
        </td></tr>
        <tr><td style="padding:24px;">${content}</td></tr>
        <tr><td style="padding:16px 24px;background:#f5f0eb;font-size:12px;color:#78716c;text-align:center;">
          PopMarket OS · Food truck market organizer
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#78716c;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1c1917;">${value}</td>
  </tr>`;
}

export function rsvpConfirmationEmail(data: RsvpEmailData) {
  const isConfirmed = data.status === 'confirmed';
  const heading = isConfirmed ? "You're in!" : "You're on the waitlist";
  const badgeColor = isConfirmed ? '#2d6a4f' : '#d97706';
  const badgeLabel = isConfirmed ? 'Confirmed' : 'Waitlisted';

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:${isConfirmed ? 'rgba(45,106,79,0.12)' : 'rgba(217,119,6,0.12)'};line-height:56px;font-size:24px;">${isConfirmed ? '✓' : '⏳'}</div>
      <h1 style="margin:16px 0 8px;font-size:24px;font-weight:800;">${heading}</h1>
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${badgeColor}20;color:${badgeColor};font-size:12px;font-weight:700;">${badgeLabel}</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;border-radius:12px;padding:4px 16px;margin:16px 0;">
      ${detailRow('Guest', data.guestName)}
      ${detailRow('Party size', String(data.partySize))}
      ${detailRow('Event', data.eventTitle)}
      ${detailRow('Date', formatDate(data.eventDate))}
      ${detailRow('Venue', data.venueName)}
      ${data.city ? detailRow('City', data.city) : ''}
      ${data.venueAddress ? detailRow('Address', data.venueAddress) : ''}
      ${detailRow('Starts', data.startTime.slice(0, 5))}
      ${data.endTime ? detailRow('Ends', data.endTime.slice(0, 5)) : ''}
      ${data.setupTime ? detailRow('Vendor setup', data.setupTime.slice(0, 5)) : ''}
    </table>
    ${data.description ? `<p style="font-size:13px;color:#78716c;line-height:1.6;">${data.description}</p>` : ''}
    <p style="font-size:13px;color:#78716c;text-align:center;margin:20px 0 16px;">
      ${isConfirmed ? 'Show your confirmation at the entrance. See you there!' : "We'll email you if spots open up."}
    </p>
    <div style="text-align:center;">
      <a href="${data.confirmationUrl}" style="display:inline-block;background:#e85d04;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;">View confirmation</a>
    </div>`;

  return {
    subject: isConfirmed
      ? `RSVP confirmed — ${data.eventTitle}`
      : `Waitlist confirmed — ${data.eventTitle}`,
    html: baseLayout(content),
  };
}

export function vendorStatusEmail(data: VendorEmailData) {
  const statusLabels = {
    pending: 'Application received',
    approved: 'Application approved',
    waitlisted: 'Application waitlisted',
    rejected: 'Application update',
  };

  const statusColors = {
    pending: '#d97706',
    approved: '#2d6a4f',
    waitlisted: '#d97706',
    rejected: '#dc2626',
  };

  const messages = {
    pending:
      'Thanks for applying! We received your vendor application and the organizer will review it shortly.',
    approved:
      'Congratulations! Your application has been approved. Complete your stall fee payment to secure your spot.',
    waitlisted:
      'Your application is on the waitlist. We will notify you if a stall becomes available.',
    rejected: 'Unfortunately your application was not accepted for this event.',
  };

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;">${statusLabels[data.status]}</h1>
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${statusColors[data.status]}20;color:${statusColors[data.status]};font-size:12px;font-weight:700;text-transform:capitalize;">${data.status}</span>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#44403c;margin:0 0 16px;">Hi ${data.ownerName}, ${messages[data.status]}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;border-radius:12px;padding:4px 16px;margin:16px 0;">
      ${detailRow('Business', data.businessName)}
      ${detailRow('Event', data.eventTitle)}
      ${detailRow('Date', formatDate(data.eventDate))}
      ${detailRow('Venue', `${data.venueName}, ${data.city}`)}
      ${data.preferredStallCode ? detailRow('Preferred stall', `${data.preferredStallCode}${data.premiumFee ? ' (Premium)' : ''}`) : ''}
      ${data.assignedStallCode ? detailRow('Assigned stall', data.assignedStallCode) : ''}
      ${data.stallFee !== undefined ? detailRow('Stall fee', formatCurrency(data.stallFee)) : ''}
      ${data.premiumFee ? detailRow('Premium spot fee', formatCurrency(data.premiumFee)) : ''}
    </table>
    ${data.rejectionReason ? `<div style="background:#fef2f2;border-radius:12px;padding:12px 16px;margin:16px 0;"><strong style="color:#dc2626;">Reason</strong><p style="margin:8px 0 0;font-size:13px;color:#44403c;">${data.rejectionReason}</p></div>` : ''}
    <div style="text-align:center;margin-top:20px;">
      <a href="${data.statusUrl}" style="display:inline-block;background:#e85d04;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;margin:4px;">View application status</a>
      ${data.paymentUrl && data.status === 'approved' ? `<br><a href="${data.paymentUrl}" style="display:inline-block;margin-top:12px;color:#2d6a4f;font-weight:700;font-size:14px;">Pay stall fee →</a>` : ''}
    </div>`;

  return {
    subject: `${statusLabels[data.status]} — ${data.eventTitle}`,
    html: baseLayout(content),
  };
}
