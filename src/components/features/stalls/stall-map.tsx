'use client';

import { useState, useTransition, useMemo } from 'react';
import { assignStallAction, ensureEventStallsAction } from '@/lib/actions/events';
import type { StallWithAssignment } from '@/types';
import { StallFloorGrid } from '@/components/features/stalls/stall-floor-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { isStallPaymentLocked } from '@/lib/stalls';
import { Lock, MapPin, Wallet, LayoutGrid } from 'lucide-react';

interface StallMapProps {
  eventId: string;
  stalls: StallWithAssignment[];
  approvedVendors: { id: string; business_name: string; cuisine_type: string }[];
  editable?: boolean;
  paidVendorCount?: number;
  gridRows?: number;
  gridCols?: number;
  isDraft?: boolean;
}

export function StallMap({
  eventId,
  stalls,
  approvedVendors,
  editable = true,
  paidVendorCount,
  gridRows,
  gridCols,
  isDraft = false,
}: StallMapProps) {
  const [selectedStall, setSelectedStall] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const lockedCount = stalls.filter(isStallPaymentLocked).length;
  const vendorsPaid = paidVendorCount ?? lockedCount;
  const assignedCount = stalls.filter((s) => s.assignment?.application).length;

  const handleAssign = (stallId: string, applicationId: string) => {
    const stall = stalls.find((s) => s.id === stallId);
    if (stall && isStallPaymentLocked(stall)) {
      toast.error('This bay is locked — vendor has already paid.');
      return;
    }

    if (!applicationId) {
      if (stall && isStallPaymentLocked(stall)) {
        toast.error('Cannot remove a paid vendor from their bay.');
        return;
      }
      setPendingRemoval(stallId);
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await assignStallAction(eventId, stallId, applicationId || null);
      if (!result.success) {
        setError(result.error ?? 'Assignment failed');
        toast.error(result.error ?? 'Assignment failed');
        return;
      }
      toast.success('Vendor assigned to stall');
      setSelectedStall(null);
    });
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;

    startTransition(async () => {
      setError(null);
      const result = await assignStallAction(eventId, pendingRemoval, null);
      if (!result.success) {
        setError(result.error ?? 'Failed to remove assignment');
        toast.error(result.error ?? 'Failed to remove assignment');
        setPendingRemoval(null);
        return;
      }
      toast.success('Stall assignment removed');
      setPendingRemoval(null);
      setSelectedStall(null);
    });
  };

  const selected = stalls.find((s) => s.id === selectedStall);
  const selectedLocked = selected ? isStallPaymentLocked(selected) : false;

  const assignableVendors = useMemo(() => {
    const assignedIds = new Set(
      stalls
        .map((s) => s.assignment?.application_id)
        .filter((id): id is string => Boolean(id)),
    );
    const currentId = selected?.assignment?.application_id;
    return approvedVendors.filter((v) => v.id === currentId || !assignedIds.has(v.id));
  }, [approvedVendors, stalls, selected?.assignment?.application_id]);

  const handleGenerateStalls = () => {
    startTransition(async () => {
      setError(null);
      const result = await ensureEventStallsAction(eventId);
      if (!result.success) {
        setError(result.error ?? 'Could not generate floor plan');
        toast.error(result.error ?? 'Could not generate floor plan');
        return;
      }
      toast.success(`Generated ${result.data?.count ?? 0} stall bays`);
    });
  };

  const emptyTitle = isDraft ? 'Draft floor plan' : 'Floor plan not set up';
  const emptyDescription = isDraft
    ? `This draft event is configured as a ${gridRows ?? '?'}×${gridCols ?? '?'} grid, but stall bays have not been created yet. Generate the layout to start assigning vendors.`
    : 'Stall bays have not been generated for this event yet.';

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-3">
        <StatPill icon={MapPin} label="Assigned bays" value={String(assignedCount)} />
        <StatPill icon={Wallet} label="Vendors paid" value={String(vendorsPaid)} accent="success" />
        <StatPill icon={Lock} label="Paid & locked" value={String(lockedCount)} />
        <StatPill
          label="Open food bays"
          value={String(
            stalls.filter(
              (s) =>
                (s.zone === 'food_truck' || s.zone === 'food_stall') &&
                s.is_available &&
                !s.assignment,
            ).length,
          )}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <StallFloorGrid
        stalls={stalls}
        mode="organizer"
        selectedStallId={selectedStall}
        disabled={!editable || isPending}
        gridRows={gridRows}
        gridCols={gridCols}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={
          editable ? (
            <Button type="button" size="sm" onClick={handleGenerateStalls} isLoading={isPending}>
              <LayoutGrid className="h-4 w-4" />
              Generate floor plan
            </Button>
          ) : undefined
        }
        onStallSelect={(stallId) => {
          if (!editable) return;
          const stall = stalls.find((s) => s.id === stallId);
          if (!stall) return;
          if (isStallPaymentLocked(stall)) {
            toast.info('Bay locked — payment received. Cannot reassign.');
            return;
          }
          setSelectedStall(stallId || null);
        }}
      />

      {editable && selectedStall && selected && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-display">
                Bay {selected.stall_code}
              </CardTitle>
              {selectedLocked && (
                <Badge className="bg-success/15 text-success border-success/30">
                  <Lock className="mr-1 h-3 w-3" />
                  Paid & locked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedLocked ? (
              <p className="text-sm text-muted-foreground">
                {selected.assignment?.application?.business_name} has paid the stall fee. This bay
                cannot be reassigned.
              </p>
            ) : (
              <Select
                label="Assign approved vendor"
                value={selected.assignment?.application_id ?? ''}
                options={[
                  { value: '', label: '— Remove assignment —' },
                  ...assignableVendors.map((v) => ({
                    value: v.id,
                    label: `${v.business_name} (${v.cuisine_type})`,
                  })),
                ]}
                onChange={(e) => handleAssign(selectedStall, e.target.value)}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon?: typeof MapPin;
  label: string;
  value: string;
  accent?: 'success';
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 font-display text-lg font-bold ${accent === 'success' ? 'text-success' : 'text-foreground'}`}
      >
        {Icon && <Icon className="mr-1.5 inline h-5 w-5 opacity-70" />}
        {value}
      </p>
    </div>
  );
}
