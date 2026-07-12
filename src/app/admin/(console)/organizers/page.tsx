import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizersTable } from '@/components/features/admin/organizers-table';
import { getOrganizersForAdmin } from '@/lib/queries/admin-organizers';

export default async function AdminOrganizersPage() {
  const organizers = await getOrganizersForAdmin();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Organizers"
        description="Your clients — search, filter by billing, view details, or remove accounts"
      />
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <OrganizersTable organizers={organizers} />
        </CardContent>
      </Card>
    </div>
  );
}
