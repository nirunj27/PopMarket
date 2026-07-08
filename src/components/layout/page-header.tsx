import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Lead, Title } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Title as="h1" className="text-2xl sm:text-3xl">
          {title}
        </Title>
        {description && <Lead className="mt-1.5 text-sm sm:text-base">{description}</Lead>}
      </div>
      {action && (
        <Link href={action.href} className={cn(buttonVariants(), 'hover-lift shrink-0')}>
          <Plus className="h-4 w-4" aria-hidden />
          {action.label}
        </Link>
      )}
    </header>
  );
}
