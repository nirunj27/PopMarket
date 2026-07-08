'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { rsvpSchema, type RsvpInput } from '@/lib/validations';
import { submitRsvpAction } from '@/lib/actions/events';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QrCodeDisplay } from '@/components/ui/qr-code-display';
import { RsvpPaymentButton } from '@/components/features/rsvp/rsvp-payment-button';
import { formatCurrency } from '@/lib/utils';
import { getAppUrl } from '@/lib/env';
import { Ticket, ShieldCheck } from 'lucide-react';

interface RsvpFormProps {
  eventSlug: string;
  eventTitle: string;
  spotsRemaining: number;
  entryFeePerGuest?: number;
}

export function RsvpForm({
  eventSlug,
  eventTitle,
  spotsRemaining,
  entryFeePerGuest = 0,
}: RsvpFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    token: string;
    status: string;
    emailSent: boolean;
    paymentPending: boolean;
    entryFeeAmount: number;
    guestName: string;
    email: string;
    paid: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpSchema) as Resolver<RsvpInput>,
    defaultValues: { partySize: 1 },
  });

  const partySize = Number(watch('partySize')) || 1;
  const totalEntryFee = entryFeePerGuest > 0 ? entryFeePerGuest * partySize : 0;

  const onSubmit = async (data: RsvpInput) => {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });

    const result = await submitRsvpAction(eventSlug, formData);

    if (!result.success) {
      setServerError(result.error ?? 'RSVP failed');
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            setError(field as keyof RsvpInput, { message });
          }
        }
      }
      setIsLoading(false);
      return;
    }

    const paymentPending = result.data?.paymentPending ?? false;
    setSuccess({
      token: result.data?.token ?? '',
      status: result.data?.status ?? 'confirmed',
      emailSent: result.data?.emailSent ?? false,
      paymentPending,
      entryFeeAmount: result.data?.entryFeeAmount ?? 0,
      guestName: data.name,
      email: data.email,
      paid: !paymentPending,
    });
    setIsLoading(false);
  };

  if (success) {
    const isWaitlisted = success.status === 'waitlisted';
    const checkInUrl = `${getAppUrl()}/rsvp/${success.token}`;
    const showQr = success.paid && !isWaitlisted;

    return (
      <div
        className={
          isWaitlisted
            ? 'space-y-3 rounded-lg border border-warning/30 bg-warning/5 p-3'
            : 'space-y-3 rounded-lg border border-success/30 bg-success/5 p-3'
        }
      >
        <div>
          <p className="font-display text-sm font-bold">
            {isWaitlisted ? "You're on the waitlist" : 'Spot reserved!'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isWaitlisted
              ? "We'll notify you if spots open up."
              : success.paymentPending
                ? `Pay ${formatCurrency(success.entryFeeAmount)} to get your entry QR pass.`
                : 'Show your QR code at the entrance.'}
          </p>
        </div>

        {success.paymentPending && !isWaitlisted && (
          <RsvpPaymentButton
            accessToken={success.token}
            amount={success.entryFeeAmount}
            guestName={success.guestName}
            email={success.email}
            eventTitle={eventTitle}
            onPaid={() => setSuccess((prev) => (prev ? { ...prev, paid: true, paymentPending: false } : prev))}
          />
        )}

        {showQr && (
          <div className="flex flex-col items-center rounded-lg border border-primary/20 bg-white p-3">
            <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-3 w-3" />
              Entry pass
            </div>
            <QrCodeDisplay value={checkInUrl} size={120} />
            <p className="mt-2 font-mono text-xs font-bold tracking-widest">
              {success.token.slice(0, 8).toUpperCase()}
            </p>
            <a href={checkInUrl} className="mt-2 text-xs font-medium text-primary hover:underline">
              Open full pass page
            </a>
          </div>
        )}

        {success.emailSent && (
          <p className="text-[10px] text-muted-foreground">Confirmation email sent.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
      {serverError && (
        <div
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/40 p-2 text-xs space-y-0.5">
        <p>
          <strong className="text-foreground">{spotsRemaining}</strong> spots remaining
        </p>
        {entryFeePerGuest > 0 && (
          <p className="flex items-center gap-1.5 text-primary font-medium">
            <Ticket className="h-4 w-4" />
            Entry fee: {formatCurrency(entryFeePerGuest)} / guest
            {partySize > 1 && (
              <span className="text-muted-foreground font-normal">
                · Total {formatCurrency(totalEntryFee)}
              </span>
            )}
          </p>
        )}
      </div>

      <Input label="Your name" required error={errors.name?.message} {...register('name')} />
      <Input
        label="Email"
        type="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="Optional"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label="Party size"
        type="number"
        min={1}
        max={20}
        required
        error={errors.partySize?.message}
        {...register('partySize')}
      />

      <Button type="submit" className="w-full" size="sm" isLoading={isLoading}>
        {entryFeePerGuest > 0
          ? `Reserve · ${formatCurrency(totalEntryFee)} to pay next`
          : 'Reserve my spot'}
      </Button>
    </form>
  );
}
