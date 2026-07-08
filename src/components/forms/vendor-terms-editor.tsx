'use client';

import { useState, useTransition } from 'react';
import { updateEventVendorTermsAction } from '@/lib/actions/events';
import { DEFAULT_VENDOR_TERMS } from '@/lib/vendor-terms';
import { VendorTermsDisplay } from '@/components/features/vendors/vendor-terms-display';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RotateCcw, Save } from 'lucide-react';

interface VendorTermsEditorProps {
  eventId: string;
  initialTerms: string;
}

export function VendorTermsEditor({ eventId, initialTerms }: VendorTermsEditorProps) {
  const [terms, setTerms] = useState(initialTerms);
  const [preview, setPreview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateEventVendorTermsAction(eventId, terms);
      if (!result.success) {
        toast.error(result.error ?? 'Could not save terms');
        return;
      }
      toast.success('Vendor terms saved');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={preview ? 'outline' : 'default'}
          size="sm"
          onClick={() => setPreview(false)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant={preview ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPreview(true)}
        >
          Preview
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTerms(DEFAULT_VENDOR_TERMS)}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to default
        </Button>
      </div>

      {preview ? (
        <VendorTermsDisplay terms={terms} compact={false} className="max-h-none" />
      ) : (
        <div className="space-y-2">
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="min-h-[420px] font-mono text-xs leading-relaxed"
            label="Terms content"
            hint="Use ## Heading for each section (shown as cards to vendors)"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={save} isLoading={isPending}>
          <Save className="h-4 w-4" />
          Save terms
        </Button>
      </div>
    </div>
  );
}
