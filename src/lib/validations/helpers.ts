import { z } from 'zod';

/** Coerce undefined/null to empty string before string validation (RHF Controllers). */
export function requiredString(message: string) {
  return z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().min(1, message),
  );
}

export function optionalString() {
  return z.preprocess(
    (val) => (val === undefined || val === null ? '' : val),
    z.string().optional(),
  );
}

/** Flatten Zod issues into friendly field errors (never expose "expected string, received undefined"). */
export function formatZodFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_form';
    let message = issue.message;

    if (
      /expected string, received undefined/i.test(message) ||
      /invalid input: expected string/i.test(message) ||
      /required/i.test(message) && /undefined/i.test(message)
    ) {
      message = 'This field is required';
    }

    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(message);
  }

  return fieldErrors;
}

export function firstZodError(error: z.ZodError): string {
  const fields = formatZodFieldErrors(error);
  const first = Object.values(fields)[0];
  return first?.[0] ?? 'Please check the form and try again';
}
