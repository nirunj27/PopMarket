'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { signupAction } from '@/lib/actions/auth';
import { queueToast } from '@/lib/toast-queue';
import { ORGANIZER_TERMS_VERSION } from '@/lib/organizer-terms';
import { INDIAN_CITIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrength } from '@/components/ui/password-strength';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizerTermsDisplay } from '@/components/features/legal/organizer-terms-display';
import type { OrganizerPlan } from '@/lib/plans';

interface SignupFormProps {
  plan?: OrganizerPlan;
  feePercent: number;
  cities?: string[];
}

export function SignupForm({
  plan = 'free',
  feePercent,
  cities = [...INDIAN_CITIES],
}: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      companyName: '',
      phone: '',
      whatsapp: '',
      address: '',
      city: '',
      pincode: '',
      gstin: '',
      website: '',
      about: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  });

  const password = watch('password') ?? '';
  const acceptedTerms = watch('acceptedTerms');

  const onInvalid = () => {
    toast.error('Fix the highlighted fields to continue.');
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('companyName', data.companyName);
    formData.append('phone', data.phone);
    formData.append('whatsapp', data.whatsapp ?? '');
    formData.append('address', data.address);
    formData.append('city', data.city);
    formData.append('pincode', data.pincode);
    formData.append('gstin', data.gstin ?? '');
    formData.append('website', data.website ?? '');
    formData.append('about', data.about ?? '');
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('plan', plan);
    formData.append('acceptedTerms', data.acceptedTerms ? 'true' : 'false');
    formData.append('termsVersion', ORGANIZER_TERMS_VERSION);

    const result = await signupAction(formData);

    if (result && !result.success) {
      const duplicateEmail = result.fieldErrors?.email?.[0];
      if (duplicateEmail) {
        toast.error(duplicateEmail);
        setServerError(duplicateEmail);
      } else {
        setServerError(result.error ?? 'Signup failed');
        if (result.fieldErrors) {
          setServerError(Object.values(result.fieldErrors).flat().join(', '));
        }
        toast.error(result.error ?? 'Signup failed');
      }
      setIsLoading(false);
      return;
    }

    queueToast('Account created — sign in to continue');
    router.replace(result?.data?.redirectTo ?? '/login');
    router.refresh();
  };

  const cityOptions = cities.map((c) => ({ value: c, label: c }));

  return (
    <Card className="card-elevated w-full border-border/60">
      <CardHeader className="border-b border-border/50 text-center sm:text-left">
        <CardTitle className="font-display text-2xl sm:text-3xl">
          Create organizer account
        </CardTitle>
        <CardDescription className="max-w-2xl">
          {plan === 'paid'
            ? 'Tell us about your organization — then collect guest entry fees with platform commission disclosed upfront.'
            : 'Tell us about your organization — run markets with free RSVPs; commission applies on paid vendor stalls.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <input type="hidden" name="plan" value={plan} />
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8" noValidate>
          {serverError && (
            <div
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account &amp; contact
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                autoComplete="name"
                autoFocus
                required
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Company / brand"
                autoComplete="organization"
                required
                placeholder="Your market or events company"
                error={errors.companyName?.message}
                {...register('companyName')}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="9876543210"
                hint="10-digit Indian mobile"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Input
                label="WhatsApp"
                type="tel"
                autoComplete="tel"
                placeholder="Same as phone if preferred"
                hint="Optional"
                error={errors.whatsapp?.message}
                {...register('whatsapp')}
              />
              <Input
                label="Website"
                type="url"
                autoComplete="url"
                placeholder="https://yoursite.com"
                hint="Optional"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Business location
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Textarea
                  label="Street address"
                  required
                  rows={2}
                  placeholder="Building, street, area"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>
              <Select
                label="City"
                required
                placeholder="Select city"
                options={cityOptions}
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="PIN code"
                required
                inputMode="numeric"
                placeholder="400001"
                maxLength={6}
                error={errors.pincode?.message}
                {...register('pincode')}
              />
              <Input
                label="GSTIN"
                placeholder="22AAAAA0000A1Z5"
                hint="Optional — for invoices"
                error={errors.gstin?.message}
                {...register('gstin')}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="About your markets"
                  rows={3}
                  placeholder="What kind of pop-ups or food truck markets do you run?"
                  hint="Optional — up to 500 characters"
                  error={errors.about?.message}
                  {...register('about')}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <PasswordInput
                  label="Password"
                  autoComplete="new-password"
                  required
                  error={errors.password?.message}
                  {...register('password')}
                />
                <PasswordStrength password={password} />
              </div>
              <PasswordInput
                label="Confirm password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <OrganizerTermsDisplay feePercent={feePercent} compact />
            <div className="flex flex-col justify-between gap-4">
              <div className="space-y-1 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptedTerms"
                    className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-input accent-primary"
                    {...register('acceptedTerms')}
                  />
                  <label
                    htmlFor="acceptedTerms"
                    className="text-sm leading-relaxed text-foreground"
                  >
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-semibold text-primary hover:underline"
                    >
                      Organizer Terms
                    </Link>
                    , including the <strong>{feePercent}% platform commission</strong> on vendor
                    stall fees and paid RSVP tickets, settled from Billing.
                  </label>
                </div>
                {errors.acceptedTerms?.message && (
                  <p className="text-xs text-destructive">{errors.acceptedTerms.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={!acceptedTerms}
              >
                Create organizer account
              </Button>
            </div>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}
