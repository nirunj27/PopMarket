import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageContainer } from '@/components/layout/page-container';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardShell>
        <PageContainer tight className="py-8 lg:py-10">
          {children}
        </PageContainer>
      </DashboardShell>
    </div>
  );
}
