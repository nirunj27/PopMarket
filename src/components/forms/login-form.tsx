'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { loginAction } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordStrength } from '@/components/ui/password-strength';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const password = watch('password') ?? '';

  const onInvalid = () => {
    toast.error('Fix the highlighted fields to sign in.');
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const result = await loginAction(formData);

    if (result && !result.success) {
      setServerError(result.error ?? 'Login failed');
      setIsLoading(false);
      return;
    }

    toast.success('Welcome');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <Card className="card-elevated w-full max-w-md border-border/60">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Welcome</CardTitle>
        <CardDescription>Sign in to manage your food truck markets</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
          {serverError && (
            <div
              className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
