import { cn } from '@/lib/utils';
import { Lead, Title } from '@/components/ui/typography';

interface SectionHeadingProps {
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  title,
  description,
  align = 'center',
  className,
  as = 'h2',
}: SectionHeadingProps) {
  return (
    <header className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      <Title as={as} className="sm:text-4xl">
        {title}
      </Title>
      {description && (
        <Lead className={cn('mt-3', align === 'center' && 'mx-auto max-w-xl')}>{description}</Lead>
      )}
    </header>
  );
}
