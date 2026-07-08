import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

type ApplicationStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected';
type PaymentStatus = 'pending' | 'paid' | 'waived' | 'overdue';

type StepState = 'complete' | 'current' | 'upcoming' | 'error' | 'warning';

interface VendorStatusProgressProps {
  applicationStatus: ApplicationStatus;
  paymentStatus?: PaymentStatus | null;
  hasAssignedStall: boolean;
}

interface Step {
  id: string;
  label: string;
  description: string;
  state: StepState;
  icon: typeof Send;
  emoji: string;
}

function getSteps({
  applicationStatus,
  paymentStatus,
  hasAssignedStall,
}: VendorStatusProgressProps): Step[] {
  const paymentDone = paymentStatus === 'paid' || paymentStatus === 'waived';
  const isApproved = applicationStatus === 'approved';
  const isRejected = applicationStatus === 'rejected';
  const isWaitlisted = applicationStatus === 'waitlisted';
  const isPending = applicationStatus === 'pending';

  const reviewState: StepState = isPending
    ? 'current'
    : isRejected
      ? 'error'
      : isWaitlisted
        ? 'warning'
        : 'complete';

  const approvalState: StepState = isRejected
    ? 'error'
    : isWaitlisted
      ? 'warning'
      : isApproved
        ? 'complete'
        : isPending
          ? 'upcoming'
          : 'upcoming';

  let paymentState: StepState = 'upcoming';
  if (!isApproved || isRejected || isWaitlisted) {
    paymentState = 'upcoming';
  } else if (paymentDone) {
    paymentState = 'complete';
  } else if (reviewState === 'complete' && approvalState === 'complete') {
    paymentState = 'current';
  }

  let stallState: StepState = 'upcoming';
  if (!isApproved || isRejected || isWaitlisted) {
    stallState = 'upcoming';
  } else if (hasAssignedStall) {
    stallState = 'complete';
  } else if (paymentState === 'complete') {
    stallState = 'current';
  } else if (paymentState === 'current') {
    stallState = 'upcoming';
  }

  let readyState: StepState = 'upcoming';
  if (isApproved && paymentDone && hasAssignedStall) {
    readyState = 'complete';
  } else if (isApproved && paymentDone && !hasAssignedStall) {
    readyState = 'current';
  } else if (isApproved && paymentState === 'current') {
    readyState = 'upcoming';
  }

  return [
    {
      id: 'submitted',
      label: 'Application sent',
      description: 'Your details are on file',
      state: 'complete',
      icon: Send,
      emoji: '📨',
    },
    {
      id: 'review',
      label: 'Organizer review',
      description: isPending
        ? 'Waiting for approval'
        : isRejected
          ? 'Application declined'
          : isWaitlisted
            ? 'On the waitlist'
            : 'Review complete',
      state: reviewState,
      icon: Clock3,
      emoji: '🔍',
    },
    {
      id: 'approved',
      label: 'Approved',
      description: isApproved
        ? 'You are in the market'
        : isRejected
          ? 'Not approved this time'
          : isWaitlisted
            ? 'Standby for a spot'
            : 'Awaiting decision',
      state: approvalState,
      icon: isRejected ? XCircle : ShieldCheck,
      emoji: isRejected ? '😔' : isWaitlisted ? '⏳' : '✅',
    },
    {
      id: 'payment',
      label: 'Stall fee',
      description: paymentDone
        ? paymentStatus === 'waived'
          ? 'Fee waived by organizer'
          : 'Payment received'
        : 'Pay to secure your spot',
      state: paymentState,
      icon: CreditCard,
      emoji: '💳',
    },
    {
      id: 'stall',
      label: 'Bay assigned',
      description: hasAssignedStall
        ? 'Your floor plan bay is set'
        : 'Organizer will assign your bay',
      state: stallState,
      icon: MapPin,
      emoji: '📍',
    },
    {
      id: 'ready',
      label: 'Event ready',
      description:
        readyState === 'complete'
          ? 'Show your vendor pass at the gate'
          : 'Complete payment & bay assignment',
      state: readyState,
      icon: Sparkles,
      emoji: '🎉',
    },
  ];
}

const stateStyles: Record<StepState, { ring: string; icon: string; line: string }> = {
  complete: {
    ring: 'border-success bg-success text-white shadow-[0_0_0_4px_rgba(45,106,79,0.15)]',
    icon: 'text-success',
    line: 'bg-success',
  },
  current: {
    ring: 'border-primary bg-primary text-white shadow-[0_0_0_6px_rgba(232,93,4,0.18)] animate-pulse',
    icon: 'text-primary',
    line: 'bg-primary/30',
  },
  upcoming: {
    ring: 'border-border bg-muted text-muted-foreground',
    icon: 'text-muted-foreground',
    line: 'bg-border',
  },
  error: {
    ring: 'border-destructive bg-destructive text-white shadow-[0_0_0_4px_rgba(220,38,38,0.15)]',
    icon: 'text-destructive',
    line: 'bg-destructive/30',
  },
  warning: {
    ring: 'border-warning bg-warning text-white shadow-[0_0_0_4px_rgba(217,119,6,0.15)]',
    icon: 'text-warning',
    line: 'bg-warning/30',
  },
};

export function VendorStatusProgress(props: VendorStatusProgressProps) {
  const steps = getSteps(props);
  const currentStep =
    steps.find((s) => s.state === 'current') ??
    (steps.find((s) => s.id === 'ready')?.state === 'complete'
      ? steps.find((s) => s.id === 'ready')
      : undefined);

  const completed = steps.filter((s) => s.state === 'complete').length;
  const progressPct = Math.round((completed / steps.length) * 100);

  return (
    <div className="space-y-5">
      {currentStep && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary via-orange-500 to-amber-500 px-5 py-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 text-7xl opacity-20">{currentStep.emoji}</div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Quest update</p>
          <p className="mt-1 font-display text-2xl font-bold">{currentStep.label}</p>
          <p className="text-sm text-white/90">{currentStep.description}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-white/80">{completed} of {steps.length} milestones complete</p>
        </div>
      )}

      <ol className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:overflow-visible">
        {steps.map((step) => {
          const Icon = step.icon;
          const styles = stateStyles[step.state];

          return (
            <li
              key={step.id}
              className={cn(
                'min-w-[120px] snap-start flex-1 rounded-2xl border bg-card p-3 text-center transition-all lg:min-w-0',
                step.state === 'current' && 'border-primary scale-[1.02] shadow-lg shadow-primary/15',
                step.state === 'complete' && 'border-success/40 bg-success/5',
                step.state === 'error' && 'border-destructive/40',
              )}
            >
              <div className="text-2xl">{step.emoji}</div>
              <div
                className={cn(
                  'mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border-2',
                  styles.ring,
                )}
              >
                {step.state === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.state === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <p className="mt-2 text-xs font-bold leading-tight">{step.label}</p>
              {step.state === 'current' && (
                <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                  Now
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
