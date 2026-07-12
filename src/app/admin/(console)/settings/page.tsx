import { PageHeader } from '@/components/layout/page-header';
import { PlatformSettingsForm } from '@/components/features/admin/platform-settings-form';
import { getPlatformSettings } from '@/lib/platform/admin';

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform settings"
        description="Control commission and payment accounts"
      />
      <PlatformSettingsForm
        initial={{
          platformFeePercent: settings.platform_fee_percent,
          razorpayKeyId: settings.razorpay_key_id ?? '',
          platformEnabled: settings.platform_enabled,
        }}
      />
    </div>
  );
}
