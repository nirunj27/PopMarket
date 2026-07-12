'use client';

import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarDays, MapPin, LayoutGrid, Sparkles } from 'lucide-react';
import { eventSchema, type EventInput } from '@/lib/validations';
import { createEventAction } from '@/lib/actions/events';
import type { EventTemplate } from '@/lib/constants/event-templates';
import { INDIAN_CITIES } from '@/lib/constants';
import {
  buildDefaultStallLayout,
  resizeStallLayout,
  type StallLayoutCell,
} from '@/lib/stall-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { EventDatePicker } from '@/components/forms/event-date-picker';
import { EventTimePicker } from '@/components/forms/event-time-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';
import { CoverImageUpload } from '@/components/forms/cover-image-upload';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventTemplatePicker } from '@/components/features/events/event-template-picker';
import { StallDesigner } from '@/components/features/events/stall-designer';
import { EventPreviewPanel } from '@/components/features/events/event-preview-panel';
import { MapPinPreview } from '@/components/features/events/map-pin-preview';
import { FeeCalculator } from '@/components/features/events/fee-calculator';
import type { BookedEventDate } from '@/lib/queries/events';

export function EventForm({
  bookedDates = [],
  availableCities = [...INDIAN_CITIES],
}: {
  bookedDates?: BookedEventDate[];
  availableCities?: string[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string>();
  const [stallLayout, setStallLayout] = useState<StallLayoutCell[]>(() =>
    buildDefaultStallLayout(6, 8),
  );
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema) as Resolver<EventInput>,
    defaultValues: {
      stallRows: 6,
      stallCols: 8,
      visitorCapacity: 500,
      stallFee: 5000,
      rsvpEntryFee: 49,
      coverImageUrl: '',
    },
  });

  const watched = watch();
  const stallRows = Number(watched.stallRows) || 6;
  const stallCols = Number(watched.stallCols) || 8;

  useEffect(() => {
    setStallLayout((current) => resizeStallLayout(current, stallRows, stallCols));
  }, [stallRows, stallCols]);

  const applyTemplate = (template: EventTemplate) => {
    setActiveTemplateId(template.id);
    reset({
      ...getValues(),
      ...template.values,
      coverImageUrl: getValues('coverImageUrl') ?? '',
    });
    setStallLayout(template.getLayout());
    toast.success(`${template.name} template applied`);
  };

  const onSubmit = async (data: EventInput) => {
    setIsLoading(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value === undefined || value === null ? '' : String(value));
    });
    formData.append('stallLayout', JSON.stringify(stallLayout));

    const result = await createEventAction(formData);

    if (!result.success) {
      toast.error(result.error ?? 'Please fix the highlighted fields');
      setIsLoading(false);
      return;
    }

    toast.success('Event created! Review details and publish when ready.');
    router.push(`/dashboard/events/${result.data?.id}`);
    router.refresh();
  };

  const handleCancel = () => {
    if (isDirty) {
      setCancelOpen(true);
      return;
    }
    router.back();
  };

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card className="border-dashed border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <EventTemplatePicker activeId={activeTemplateId} onSelect={applyTemplate} />
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <Card className="overflow-hidden border-primary/10">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Event details</CardTitle>
                    <p className="text-sm text-muted-foreground">Name, cover image, and description</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Controller
                  name="coverImageUrl"
                  control={control}
                  render={({ field }) => (
                    <CoverImageUpload value={field.value} onChange={field.onChange} />
                  )}
                />
                <Input
                  label="Event title"
                  placeholder="Mumbai Food Truck Festival 2026"
                  required
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe your food truck market, theme, and what visitors can expect..."
                  hint="Shown on the public event page"
                  error={errors.description?.message}
                  {...register('description')}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-secondary/10">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Venue</CardTitle>
                    <p className="text-sm text-muted-foreground">Where will your market take place?</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <Input
                  label="Venue name"
                  placeholder="Bandra Kurla Complex Grounds"
                  required
                  error={errors.venueName?.message}
                  {...register('venueName')}
                />
                <Select
                  label="City"
                  required
                  placeholder="Select city"
                  options={availableCities.map((c) => ({ value: c, label: c }))}
                  error={errors.city?.message}
                  {...register('city')}
                />
                <div className="sm:col-span-2">
                  <Controller
                    name="venueAddress"
                    control={control}
                    render={({ field }) => (
                      <AddressAutocomplete
                        label="Venue address"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        onPlaceSelect={({ city, venueName }) => {
                          if (city && availableCities.includes(city)) {
                            setValue('city', city, { shouldValidate: true });
                          }
                          if (venueName) {
                            setValue('venueName', venueName, { shouldValidate: true });
                          }
                        }}
                        error={errors.venueAddress?.message}
                        hint="Search with Google Maps or type your full address manually"
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-accent/20">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-accent/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Schedule</CardTitle>
                    <p className="text-sm text-muted-foreground">Date and operating hours</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Controller
                    name="eventDate"
                    control={control}
                    render={({ field }) => (
                      <EventDatePicker
                        label="Event date"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        bookedDates={bookedDates}
                        hint="Dates with existing events are blocked"
                        error={errors.eventDate?.message}
                      />
                    )}
                  />
                </div>
                <Controller
                  name="setupTime"
                  control={control}
                  render={({ field }) => (
                    <EventTimePicker
                      label="Vendor setup time"
                      value={field.value}
                      onChange={field.onChange}
                      maxTime={watched.startTime}
                      hint="When food trucks can arrive and set up"
                      error={errors.setupTime?.message}
                    />
                  )}
                />
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <EventTimePicker
                      label="Market start time"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startTime?.message}
                    />
                  )}
                />
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <EventTimePicker
                      label="Market end time"
                      required
                      value={field.value}
                      onChange={field.onChange}
                      minTime={watched.startTime}
                      error={errors.endTime?.message}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Market layout & capacity</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Grid size, fees, and drag-and-drop floor plan
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Stall rows"
                    type="number"
                    min={3}
                    max={30}
                    required
                    error={errors.stallRows?.message}
                    {...register('stallRows')}
                  />
                  <Input
                    label="Stall columns"
                    type="number"
                    min={3}
                    max={30}
                    required
                    error={errors.stallCols?.message}
                    {...register('stallCols')}
                  />
                  <Input
                    label="Visitor capacity"
                    type="number"
                    min={50}
                    max={50000}
                    required
                    hint="Maximum confirmed RSVPs for this market"
                    error={errors.visitorCapacity?.message}
                    {...register('visitorCapacity')}
                  />
                  <Input
                    label="Stall fee (₹)"
                    type="number"
                    min={100}
                    step={1}
                    required
                    hint="Whole rupees only — minimum ₹100"
                    error={errors.stallFee?.message}
                    {...register('stallFee')}
                  />
                  <Input
                    label="RSVP entry fee (₹)"
                    type="number"
                    min={0}
                    max={5000}
                    step={1}
                    hint="Optional small fee per guest (0 = free RSVP)"
                    error={errors.rsvpEntryFee?.message}
                    {...register('rsvpEntryFee')}
                  />
                </div>

                <StallDesigner
                  rows={stallRows}
                  cols={stallCols}
                  layout={stallLayout}
                  onLayoutChange={setStallLayout}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create event
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <EventPreviewPanel
            title={watched.title}
            description={watched.description}
            coverImageUrl={watched.coverImageUrl}
            venueName={watched.venueName}
            city={watched.city}
            eventDate={watched.eventDate}
            startTime={watched.startTime}
            endTime={watched.endTime}
            visitorCapacity={Number(watched.visitorCapacity)}
            stallFee={Number(watched.stallFee)}
            rsvpEntryFee={Number(watched.rsvpEntryFee) || 0}
          />
          <MapPinPreview address={watched.venueAddress} />
          <FeeCalculator layout={stallLayout} stallFee={Number(watched.stallFee) || 0} />
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Discard changes?"
        description="You have unsaved changes. Leaving now will lose your progress."
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.back()}
        onCancel={() => setCancelOpen(false)}
      />
    </>
  );
}
