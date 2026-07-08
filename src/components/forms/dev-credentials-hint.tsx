import { Card, CardContent } from '@/components/ui/card';

export function DevCredentialsHint() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4 text-sm">
        <p className="font-semibold text-primary">Demo account (dev)</p>
        <p className="mt-2 text-muted-foreground">
          Email: <code className="text-foreground">organizer@popmarket.dev</code>
        </p>
        <p className="text-muted-foreground">
          Password: <code className="text-foreground">Demo@12345</code>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Run <code>npm run seed:dev</code> to reset this user.
        </p>
      </CardContent>
    </Card>
  );
}
