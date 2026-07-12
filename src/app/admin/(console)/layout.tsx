import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { requireSuperadmin } from '@/lib/platform/admin';

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await requireSuperadmin();
  if (!gate.ok) {
    redirect('/admin/login?redirect=/admin');
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
