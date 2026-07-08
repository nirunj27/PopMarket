import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SetupBanner() {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-semibold text-warning">Supabase not configured</p>
          <p className="mt-1 text-muted-foreground">
            Copy <code className="rounded bg-muted px-1">.env.example</code> to{' '}
            <code className="rounded bg-muted px-1">.env.local</code>, add your Supabase keys, and
            run the SQL schema from{' '}
            <code className="rounded bg-muted px-1">supabase/schema.sql</code>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
