import { SiteHeader } from '@/components/layout/site-header';
import { PublicThemeLock } from '@/components/layout/public-theme-lock';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-portal flex min-h-screen flex-col">
      <PublicThemeLock />
      <SiteHeader variant="minimal" />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
