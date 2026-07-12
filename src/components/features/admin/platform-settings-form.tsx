'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updatePlatformSettingsAction } from '@/lib/actions/platform';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface PlatformSettingsFormProps {
  initial: {
    platformFeePercent: number;
    razorpayKeyId: string;
    platformEnabled: boolean;
  };
}

export function PlatformSettingsForm({ initial }: PlatformSettingsFormProps) {
  const [fee, setFee] = useState(String(initial.platformFeePercent));
  const [keyId, setKeyId] = useState(initial.razorpayKeyId);
  const [keySecret, setKeySecret] = useState('');
  const [enabled, setEnabled] = useState(initial.platformEnabled);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('platformFeePercent', fee);
      formData.append('razorpayKeyId', keyId);
      formData.append('razorpayKeySecret', keySecret);
      formData.append('platformEnabled', enabled ? 'true' : 'false');

      const result = await updatePlatformSettingsAction(formData);
      if (!result.success) {
        toast.error(result.error ?? 'Failed to save settings');
        return;
      }
      toast.success('Platform settings saved');
      setKeySecret('');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform commission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Platform fee %"
            type="number"
            min={0}
            max={50}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            hint="Taken from every paid vendor stall fee and RSVP ticket"
          />
          <Checkbox
            label="Platform enabled"
            description="When off, organizers cannot create or publish new markets"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Razorpay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Platform Razorpay keys for commission settlements (organizers pay PopMarket from Billing).
            Vendor and RSVP checkout for organizers&apos; customers still use the app env keys.
          </p>
          <Input
            label="Razorpay Key ID"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_live_..."
          />
          <Input
            label="Razorpay Key Secret"
            type="password"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            hint="Leave blank to keep the existing secret"
            placeholder="••••••••"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} isLoading={isPending}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
