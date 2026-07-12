'use client';

import { useForm, type Resolver, type FieldErrors, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactNode } from 'react';
import { vendorApplicationSchema, type VendorApplicationInput } from '@/lib/validations';
import { submitVendorApplicationAction } from '@/lib/actions/events';
import { FOOD_CUISINES } from '@/lib/constants';
import type { StallWithAssignment } from '@/types';
import type { MenuItem } from '@/lib/menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { VendorStallPicker } from '@/components/forms/vendor-stall-picker';
import { MenuItemsEditor } from '@/components/forms/menu-items-editor';
import { VendorTermsDisplay } from '@/components/features/vendors/vendor-terms-display';
import { CopyableStatusLink } from '@/components/ui/copyable-status-link';
import { cn } from '@/lib/utils';
import { Building2, FileText, MapPin, Send, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

const fieldClass = 'h-9 rounded-lg border text-sm';

interface VendorApplicationFormProps {
  eventSlug: string;
  eventTitle: string;
  stalls: StallWithAssignment[];
  baseStallFee: number;
  vendorTerms: string;
  /** Organizer draft preview — form visible but submit blocked */
  previewMode?: boolean;
}

export function VendorApplicationForm({
  eventSlug,
  eventTitle,
  stalls,
  baseStallFee,
  vendorTerms,
  previewMode = false,
}: VendorApplicationFormProps) {
  const [success, setSuccess] = useState<{ token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<VendorApplicationInput>({
    resolver: zodResolver(vendorApplicationSchema) as Resolver<VendorApplicationInput>,
    defaultValues: {
      needsPower: false,
      needsWater: false,
      vendorType: 'food_truck',
      preferredStallId: '',
      cuisineType: '',
      menuDescription: '',
      menuItems: '[]',
      acceptedTerms: false,
    },
  });

  const [needsPower, setNeedsPower] = useState(false);
  const vendorType = watch('vendorType');
  const acceptedTerms = watch('acceptedTerms');

  const onInvalid = (fieldErrors: FieldErrors<VendorApplicationInput>) => {
    const first = Object.values(fieldErrors).find((e) => e?.message);
    if (first?.message) toast.error(first.message);
  };

  const onSubmit = async (data: VendorApplicationInput) => {
    if (previewMode) {
      toast.info('Publish the event to accept real vendor applications.');
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    const payload = { ...data, menuItems: JSON.stringify(menuItems) };
    Object.entries(payload).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      } else {
        formData.append(key, '');
      }
    });

    const result = await submitVendorApplicationAction(eventSlug, formData);

    if (!result.success) {
      toast.error(result.error ?? 'Application failed');
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          const message = messages?.[0];
          if (message) {
            setError(field as keyof VendorApplicationInput, { message });
          }
        }
      }
      setIsLoading(false);
      return;
    }

    setSuccess({
      token: result.data?.token ?? '',
    });
    toast.success('Submitted! Copy your status link below.');
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-xl border border-success/30 bg-card p-4 shadow-sm">
        <CopyableStatusLink
          path={`/vendor/${success.token}`}
          title="Application submitted!"
          description={`Your application for ${eventTitle} has been received. Bookmark this link to track approval, stall assignment, and payment.`}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3" noValidate>
      <FormSection icon={Building2} title="Business & contact" step={1}>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <Input
            className={fieldClass}
            label="Business name"
            required
            error={errors.businessName?.message}
            {...register('businessName')}
          />
          <Input
            className={fieldClass}
            label="Truck / stall name"
            required
            placeholder="Mumbai Masala Truck"
            error={errors.truckName?.message}
            {...register('truckName')}
          />
          <Input
            className={fieldClass}
            label="Owner name"
            required
            error={errors.ownerName?.message}
            {...register('ownerName')}
          />
          <Input
            className={fieldClass}
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            className={fieldClass}
            label="Phone"
            type="tel"
            placeholder="9876543210"
            required
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            className={fieldClass}
            label="Instagram"
            placeholder="@yourtruck"
            error={errors.instagramHandle?.message}
            {...register('instagramHandle')}
          />
          <Select
            className={fieldClass}
            label="Vendor type"
            required
            options={[
              { value: 'food_truck', label: 'Food truck' },
              { value: 'food_stall', label: 'Food stall / cart' },
            ]}
            error={errors.vendorType?.message}
            {...register('vendorType')}
          />
          <Select
            className={fieldClass}
            label="Cuisine"
            required
            placeholder="Select cuisine"
            options={FOOD_CUISINES.map((c) => ({ value: c, label: c }))}
            error={errors.cuisineType?.message}
            {...register('cuisineType')}
          />
          {vendorType === 'food_truck' && (
            <Input
              className={fieldClass}
              label="Truck length (ft)"
              type="number"
              min={8}
              max={40}
              error={errors.truckLengthFt?.message}
              {...register('truckLengthFt')}
            />
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-4 rounded-lg border border-border/50 bg-muted/15 px-3 py-2">
          <Checkbox
            label="Power"
            description="15A"
            {...register('needsPower', {
              onChange: (e) => setNeedsPower(e.target.checked),
            })}
          />
          <Checkbox
            label="Water"
            description="Hookup"
            {...register('needsWater')}
          />
        </div>

        {needsPower && (
          <Input
            className={cn(fieldClass, 'mt-2.5')}
            label="Power requirements"
            placeholder="e.g. 2 × 15A outlets"
            error={errors.powerRequirements?.message}
            {...register('powerRequirements')}
          />
        )}
      </FormSection>

      <FormSection icon={UtensilsCrossed} title="Menu" step={2}>
        <Textarea
          className="min-h-[72px] rounded-lg px-3 py-2 text-sm"
          label="Short description"
          placeholder="Specialties, dietary notes (optional if you add items below)"
          error={errors.menuDescription?.message}
          {...register('menuDescription')}
        />
        <div className="mt-2.5">
          <MenuItemsEditor
            items={menuItems}
            onChange={(next) => {
              setMenuItems(next);
              setValue('menuItems', JSON.stringify(next), { shouldValidate: true });
            }}
            error={errors.menuDescription?.message}
          />
        </div>
      </FormSection>

      <FormSection icon={MapPin} title="Preferred bay" step={3} optional>
        <Controller
          name="preferredStallId"
          control={control}
          render={({ field }) => (
            <VendorStallPicker
              stalls={stalls}
              baseStallFee={baseStallFee}
              value={field.value || undefined}
              onChange={field.onChange}
              error={errors.preferredStallId?.message}
            />
          )}
        />
      </FormSection>

      <FormSection icon={FileText} title="Terms & conditions" step={4}>
        <VendorTermsDisplay terms={vendorTerms} />
        <div className="mt-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
          <Checkbox
            label="I have read and agree to the vendor terms & conditions"
            description="Required to submit your application"
            {...register('acceptedTerms')}
          />
          {errors.acceptedTerms?.message && (
            <p className="mt-1.5 text-xs text-destructive" role="alert">
              {errors.acceptedTerms.message}
            </p>
          )}
        </div>
      </FormSection>

      <div className="sticky bottom-2 z-10 flex flex-col gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-md backdrop-blur-sm sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 text-[11px] text-muted-foreground">
          {previewMode
            ? 'Draft preview — submit is disabled until you publish.'
            : acceptedTerms
              ? 'Ready to submit — you will receive a link to track approval and pay the stall fee.'
              : 'Accept the terms above to enable submission.'}
        </p>
        <button
          type="submit"
          disabled={isLoading || !acceptedTerms || previewMode}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit application
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  icon: Icon,
  title,
  step,
  optional,
  children,
}: {
  icon: typeof Building2;
  title: string;
  step: number;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="portal-panel overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-2.5 py-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
          {step}
        </span>
        <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />
        <h3 className="flex-1 text-xs font-semibold">{title}</h3>
        {optional && (
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Optional
          </span>
        )}
      </header>
      <div className="p-2.5">{children}</div>
    </section>
  );
}
