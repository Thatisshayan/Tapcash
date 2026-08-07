/**
 * Fetch wrapper for /api/admin/* calls from the admin dashboard.
 *
 * Admin routes authenticate via the `admin_session` HTTP-only cookie (see
 * requireAdminSession() in src/lib/admin-session.ts), not a Bearer token --
 * the cookie auto-attaches on same-origin requests, so no Authorization
 * header is needed or accepted. State-changing requests additionally need
 * the CSRF header (double-submit-cookie pattern, src/lib/csrf.ts): this
 * reads the non-HTTP-only csrf_token cookie and attaches it as
 * x-csrf-token for any non-GET/HEAD/OPTIONS request.
 */

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (!SAFE_METHODS.includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set("x-csrf-token", csrfToken);
  }

  return fetch(url, { ...init, headers, credentials: "same-origin" });
}
