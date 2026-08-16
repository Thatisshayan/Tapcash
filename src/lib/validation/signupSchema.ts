import { z } from "zod";

const MIN_AGE = 13;

function isValidAge(dateStr: string): boolean {
  const dob = new Date(dateStr);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= MIN_AGE;
}

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date of birth must be in YYYY-MM-DD format",
    })
    .refine((val) => isValidAge(val), {
      message: `You must be at least ${MIN_AGE} years old to register`,
    }),
  tosAccepted: z.literal(true, {
    message: "You must accept the Terms of Service",
  }),
  privacyAccepted: z.literal(true, {
    message: "You must accept the Privacy Policy",
  }),
  marketingAccepted: z.boolean().optional().default(false),
});

export type SignupInput = z.infer<typeof signupSchema>;

