import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),

  SESSION_SECRET: z.string().min(32),

  RAPIDOREACH_APP_ID: z.string().min(1),
  RAPIDOREACH_APP_KEY: z.string().min(1),
  RAPIDOREACH_APP_SECRET: z.string().min(1),
  RAPIDOREACH_TRANSACTION_KEY: z.string().min(1),

  PROXYCHECK_API_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),

  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  PAYPAL_CLIENT_ID: z.string().min(1).optional(),
  PAYPAL_CLIENT_SECRET: z.string().min(1).optional(),
  PAYPAL_MODE: z.enum(["sandbox", "live"]).optional(),

  TREMENDOUS_API_KEY: z.string().min(1).optional(),
  TREMENDOUS_CAMPAIGN_ID: z.string().min(1).optional(),
  TREMENDOUS_ENVIRONMENT: z.enum(["testflight", "production"]).optional(),

  ADMIN_UIDS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function validateEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`
    );
    console.error(
      "[ENV] Invalid environment variables:\n" + missing.join("\n")
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
    console.warn(
      "[ENV] Running with incomplete env vars (non-production mode)"
    );
  }

  _env = (result.success ? result.data : process.env) as Env;
  return _env;
}
