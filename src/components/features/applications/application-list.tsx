'use client';

import { useState, useTransition } from 'react';
import { reviewApplicationAction } from '@/lib/actions/events';
import { APPLICATION_STATUS_CONFIG } from '@/lib/constants';
import type { VendorApplication } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatDate } from '@/lib/utils';
import { Check, Clock, X, Zap, Droplets } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationListProps {
  applications: VendorApplication[];
}

export function ApplicationList({ applications }: ApplicationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReview = (applicationId: string, status: 'approved' | 'waitlisted' | 'rejected') => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('status', status);
      if (status === 'rejected') {
        formData.append('rejectionReason', rejectionReason);
      }
      const result = await reviewApplicationAction(applicationId, formData);

      if (!result.success) {
        toast.error(result.error ?? 'Failed to update application');
        return;
      }

      const messages = {
        approved: 'Vendor approved successfully',
        waitlisted: 'Vendor added to waitlist',
        rejected: 'Application rejected',
      };
      toast.success(messages[status]);

      if (result.data?.emailSent === false) {
        toast.warning(
          result.data.emailError
            ? `Status updated but email failed: ${result.data.emailError}`
            : 'Status updated but email was not sent. Check Resend configuration.',
        );
      }

      setExpandedId(null);
      setRejectionReason('');
    });
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No vendor applications yet. Share your event link to attract food trucks.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const statusConfig = APPLICATION_STATUS_CONFIG[app.status];
        const isExpanded = expandedId === app.id;

        return (
          <Card key={app.id} className={cn('transition-shadow', isExpanded && 'shadow-md')}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{app.business_name}</h3>
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.cuisine_type} · {app.owner_name} · {app.email}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {app.needs_power && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Power
                      </span>
                    )}
                    {app.needs_water && (
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" /> Water
                      </span>
                    )}
                    {app.truck_length_ft && <span>Truck: {app.truck_length_ft}ft</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Applied {formatDate(app.created_at)}
                  </p>
                </div>

                {app.status === 'pending' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleReview(app.id, 'approved')}
                    >
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={isPending}
                      onClick={() => handleReview(app.id, 'waitlisted')}
                    >
                      <Clock className="h-3 w-3" /> Waitlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    >
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <p className="text-sm">{app.menu_description}</p>
                  <Textarea
                    label="Rejection reason"
                    placeholder="Let the vendor know why..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending || !rejectionReason.trim()}
                    onClick={() => handleReview(app.id, 'rejected')}
                  >
                    Confirm rejection
                  </Button>
                </div>
              )}

              {!isExpanded && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {app.menu_description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
