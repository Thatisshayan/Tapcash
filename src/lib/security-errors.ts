export class SecurityError extends Error {
  constructor(public readonly reason: string, public readonly meta?: Record<string, unknown>) {
    super(reason);
    this.name = 'SecurityError';
  }
}

export function assertConfigured(flags: Record<string, boolean | undefined | string>, names: string[]) {
  const missing = names.filter((name) => !flags[name]);
  if (missing.length > 0) {
    throw new SecurityError(`Missing configuration: ${missing.join(', ')}`);
  }
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof SecurityError) return error.reason;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Unknown error';
}
