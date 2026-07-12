import { PageHeader } from '@/components/layout/page-header';
import { PlatformGuide } from '@/components/features/guides/platform-guide';
import { ORGANIZER_GUIDE } from '@/lib/guides/platform-guides';

export default function OrganizerGuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform guide"
        description="Your playbook for running markets on PopMarket"
      />
      <PlatformGuide guide={ORGANIZER_GUIDE} />
    </div>
  );
}
