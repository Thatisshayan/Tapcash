import type { SignupInput } from "./signupSchema";

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string; // YYYY-MM-DD, as produced by <input type="date">
  agreedToPolicies: boolean; // one checkbox covering Terms + Privacy Policy
}

/**
 * Build the /api/auth/signup request body from the sign-up form.
 * Keeps the client payload in lockstep with signupSchema; the contract is
 * covered by src/lib/__tests__/buildSignupPayload.test.ts.
 */
export function buildSignupPayload(
  values: SignupFormValues,
  deviceFingerprint?: string
): Omit<SignupInput, "marketingAccepted"> & { deviceFingerprint?: string } {
  const displayName = values.name.trim();
  return {
    email: values.email.trim(),
    password: values.password,
    displayName: displayName.length > 0 ? displayName : undefined,
    dateOfBirth: values.dateOfBirth,
    tosAccepted: values.agreedToPolicies as true,
    privacyAccepted: values.agreedToPolicies as true,
    deviceFingerprint,
  };
}

/** Turn the API's validation response into one readable message. */
export function signupErrorMessage(data: { error?: string; details?: string[] } | null, fallback: string): string {
  if (!data) return fallback;
  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details.map((d) => d.replace(/^[A-Za-z]+:\s*/, "")).join(" ");
  }
  return data.error || fallback;
}
