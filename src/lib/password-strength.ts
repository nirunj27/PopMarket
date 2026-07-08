export interface PasswordCheck {
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number;
  label: string;
  checks: PasswordCheck[];
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks: PasswordCheck[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return {
    score,
    label: labels[score] ?? 'Weak',
    checks,
  };
}
