'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { signupAction } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrength } from '@/components/ui/password-strength';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrganizerPlan } from '@/lib/plans';

interface SignupFormProps {
  plan?: OrganizerPlan;
}

export function SignupForm({ plan = 'free' }: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', companyName: '', password: '', confirmPassword: '' },
  });

  const password = watch('password') ?? '';

  const onInvalid = () => {
    toast.error('Fix the highlighted fields to continue.');
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setServerError(null);
    setServerInfo(null);

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('companyName', data.companyName ?? '');
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('plan', plan);

    const result = await signupAction(formData);

    if (result && !result.success) {
      const duplicateEmail = result.fieldErrors?.email?.[0];
      if (duplicateEmail) {
        toast.error(duplicateEmail);
        setServerError(duplicateEmail);
      } else {
        setServerError(result.error ?? 'Signup failed');
        if (result.fieldErrors) {
          setServerError(Object.values(result.fieldErrors).flat().join(', '));
        }
        toast.error(result.error ?? 'Signup failed');
      }
      setIsLoading(false);
      return;
    }

    if (result.data?.requiresEmailConfirmation) {
      const message = 'Account created! Check your email for a confirmation link.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(message);
      setServerInfo(message);
      setIsLoading(false);
      return;
    }

    toast.success('Welcome! Your organizer account is ready.');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card className="card-elevated w-full max-w-md border-border/60">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Create your account</CardTitle>
        <CardDescription>
          {plan === 'paid'
            ? 'Collect entry fees from guests at your markets'
            : 'Start organizing food truck markets with free RSVPs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input type="hidden" name="plan" value={plan} />
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
          {serverError && (
            <div
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </div>
          )}

          {serverInfo && (
            <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success" role="status">
              {serverInfo}
            </div>
          )}

          <Input
            label="Full name"
            autoComplete="name"
            autoFocus
            required
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Company / Organization"
            hint="Optional — your market or event company name"
            autoComplete="organization"
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
