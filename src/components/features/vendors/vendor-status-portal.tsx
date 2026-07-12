import type { ReactNode } from 'react';
import { APPLICATION_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getVendorMenuLines, stripMenuMarkerForDisplay } from '@/lib/menu';
import { MenuItemsTable } from '@/components/features/menu/menu-items-table';
import { Badge } from '@/components/ui/badge';
import { VendorPaymentButton } from '@/components/features/vendors/vendor-payment-button';
import { VendorStatusProgress } from '@/components/features/vendors/vendor-status-progress';
import { VendorPassCard } from '@/components/features/vendors/vendor-pass-card';
import {
  PublicPortalShell,
  PortalPanel,
  PortalStat,
  PortalStatStrip,
} from '@/components/layout/public-portal-shell';
import {
  Building2,
  ChefHat,
  Mail,
  Phone,
  UtensilsCrossed,
} from 'lucide-react';

interface VendorStatusPortalProps {
  accessToken: string;
  application: {
    business_name: string;
    truck_name?: string | null;
    owner_name: string;
    email: string;
    phone: string;
    cuisine_type: string;
    vendor_type: string;
    status: string;
    rejection_reason?: string | null;
    menu_description?: string | null;
    menu_items?: unknown;
    instagram_handle?: string | null;
  };
  event: {
    title: string;
    event_date: string;
    venue_name: string;
    city: string;
    stall_fee: number;
  };
  payment: {
    amount: number;
    status: string;
    paid_at?: string | null;
    razorpay_payment_id?: string | null;
  } | null;
  assignedStall: {
    stall_code: string;
    is_premium: boolean;
    premium_fee: number;
  } | null;
  preferredStall: {
    stall_code: string;
    is_premium: boolean;
    premium_fee?: number;
  } | null;
}

export function VendorStatusPortal({
  accessToken,
  application,
  event,
  payment,
  assignedStall,
  preferredStall,
}: VendorStatusPortalProps) {
  const statusKey = application.status as keyof typeof APPLICATION_STATUS_CONFIG;
  const statusConfig = APPLICATION_STATUS_CONFIG[statusKey];
  const paymentConfig = payment
    ? PAYMENT_STATUS_CONFIG[payment.status as keyof typeof PAYMENT_STATUS_CONFIG]
    : null;

  const paymentDone = payment?.status === 'paid' || payment?.status === 'waived';
  const isReady = application.status === 'approved' && paymentDone && !!assignedStall;
  const menuLines = getVendorMenuLines(application.menu_items, application.menu_description);

  return (
    <PublicPortalShell
      eyebrow="Vendor status"
      title={application.business_name}
      subtitle={`${event.title} · ${formatDate(event.event_date)} · ${event.venue_name}, ${event.city}`}
    >
      <PortalStatStrip>
        <PortalStat label="Application" value={<Badge className={`${statusConfig.color} text-[10px]`}>{statusConfig.label}</Badge>} />
        {paymentConfig && (
          <PortalStat label="Payment" value={<Badge className={`${paymentConfig.color} text-[10px]`}>{paymentConfig.label}</Badge>} />
        )}
        <PortalStat label="Stall fee" value={formatCurrency(event.stall_fee)} highlight />
        {assignedStall && (
          <PortalStat label="Bay" value={<span className="font-display text-sm">{assignedStall.stall_code}</span>} highlight />
        )}
      </PortalStatStrip>

      <PortalPanel title="Application journey">
        <VendorStatusProgress
          applicationStatus={application.status as 'pending' | 'approved' | 'waitlisted' | 'rejected'}
          paymentStatus={
            payment?.status as 'pending' | 'paid' | 'waived' | 'overdue' | null | undefined
          }
          hasAssignedStall={!!assignedStall}
        />
      </PortalPanel>

      <div className="space-y-2">
        <PortalPanel title="Application details">
          <dl className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem icon={Building2} label="Owner" value={application.owner_name} />
            <DetailItem icon={Mail} label="Email" value={application.email} />
            <DetailItem icon={Phone} label="Phone" value={application.phone} />
            <DetailItem
              icon={UtensilsCrossed}
              label="Type"
              value={application.vendor_type === 'food_truck' ? 'Food truck' : 'Food stall'}
            />
            <DetailItem icon={ChefHat} label="Cuisine" value={application.cuisine_type} />
            {preferredStall && (
              <DetailItem
                icon={Building2}
                label="Preferred bay"
                value={`${preferredStall.stall_code}${preferredStall.is_premium ? ' (Premium)' : ''}`}
              />
            )}
            {assignedStall && (
              <DetailItem
                icon={Building2}
                label="Assigned bay"
                value={
                  <span className="font-display text-sm font-bold text-primary">
                    {assignedStall.stall_code}
                  </span>
                }
              />
            )}
          </dl>

          {(menuLines.length > 0 || application.menu_description) && (
            <div className="mt-2 border-t border-border pt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Menu
              </p>
              {menuLines.length === 0 && stripMenuMarkerForDisplay(application.menu_description) && (
                <p className="mb-1.5 text-xs text-muted-foreground">
                  {stripMenuMarkerForDisplay(application.menu_description)}
                </p>
              )}
              {menuLines.length > 0 && <MenuItemsTable items={menuLines} />}
            </div>
          )}
        </PortalPanel>

        {application.rejection_reason && (
          <PortalPanel>
            <p className="text-xs font-semibold text-destructive">Reason for decision</p>
            <p className="mt-0.5 text-xs text-destructive/90">{application.rejection_reason}</p>
          </PortalPanel>
        )}

        {application.status === 'pending' && (
          <PortalPanel title="What happens next">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your application is with the organizer for review. Bookmark this page and check back
              for approval, waitlist, or rejection updates. No action is needed right now.
            </p>
          </PortalPanel>
        )}

        {application.status === 'waitlisted' && (
          <PortalPanel title="Waitlist">
            <p className="text-xs leading-relaxed text-muted-foreground">
              You are on the waitlist. If a bay opens up, the organizer may approve your
              application — check this status page for updates.
            </p>
          </PortalPanel>
        )}

        {payment && (
          <PortalPanel title="Stall fee & payment" className="scroll-mt-20">
            <div id="pay" className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                <span className="text-muted-foreground">Amount due</span>
                <span className="font-display text-base font-bold">
                  {formatCurrency(Number(payment.amount))}
                </span>
              </div>

              {application.status === 'approved' && payment.status === 'pending' && (
                <VendorPaymentButton
                  accessToken={accessToken}
                  amount={Number(payment.amount)}
                  businessName={application.business_name}
                  email={application.email}
                />
              )}

              {payment.status === 'paid' && (
                <p className="rounded-md bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success">
                  Payment received — your stall is secured!
                </p>
              )}

              {payment.status === 'waived' && (
                <p className="rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                  Stall fee waived by the organizer.
                </p>
              )}
            </div>
          </PortalPanel>
        )}

        {application.status === 'approved' && !payment && (
          <PortalPanel>
            <p className="text-xs font-medium text-warning">
              Approved! If payment details are missing, contact the organizer or refresh this page.
            </p>
          </PortalPanel>
        )}
      </div>

      {isReady && assignedStall && payment && (
        <PortalPanel title="Vendor pass" noPadding>
          <div className="p-3">
            <VendorPassCard
              accessToken={accessToken}
              businessName={application.business_name}
              truckName={application.truck_name}
              cuisineType={application.cuisine_type}
              vendorType={application.vendor_type}
              eventTitle={event.title}
              eventDate={event.event_date}
              venueName={event.venue_name}
              city={event.city}
              stallCode={assignedStall.stall_code}
              amount={Number(payment.amount)}
              paidAt={payment.paid_at}
              paymentId={payment.razorpay_payment_id}
            />
          </div>
        </PortalPanel>
      )}
    </PublicPortalShell>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5 rounded-md border border-border/50 bg-muted/10 px-2 py-1.5">
      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="text-xs font-medium">{value}</dd>
      </div>
    </div>
  );
}
