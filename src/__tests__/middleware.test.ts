/**
 * @jest-environment node
 *
 * jsdom lacks the global Request/fetch API that NextRequest needs, and
 * jest.setup.ts globally mocks next/server with a stub NextRequest that has
 * no .nextUrl -- this file needs both the real Node environment and the
 * real NextRequest to exercise middleware.ts's actual pathname/cookie
 * logic. Per-file only; no other test file is affected. Precedent:
 * src/lib/__tests__/admin-session.test.ts.
 */
jest.unmock("next/server");

import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { setNodeEnv } from "../lib/testHelpers/testEnv";

const SECRET = "test-middleware-secret";

async function signSessionJwt(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(SECRET));
}

function requestFor(path: string, cookieValue?: string): NextRequest {
  const headers = new Headers();
  if (cookieValue) headers.set("cookie", `session=${cookieValue}`);
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("middleware", () => {
  const ORIGINAL_SECRET = process.env.SESSION_SECRET;
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
    setNodeEnv("production");
    jest.resetModules();
  });

  afterEach(() => {
    process.env.SESSION_SECRET = ORIGINAL_SECRET;
    setNodeEnv(ORIGINAL_NODE_ENV ?? "test");
  });

  it("passes through a public route with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/"));

    expect(response.status).toBe(200);
  });

  it("redirects to /auth/signin for an AUTH_ROUTES path with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("redirects to /auth/signin for an ADMIN_ROUTES path with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("redirects a non-admin session away from an admin path to /dashboard", async () => {
    const jwt = await signSessionJwt({ uid: "user-1", email: "user@tapcash.online", admin: false });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin", jwt));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows an admin session through to an admin path", async () => {
    const jwt = await signSessionJwt({ uid: "admin-1", email: "admin@tapcash.online", admin: true });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin", jwt));

    expect(response.status).toBe(200);
  });

  it("allows a valid non-admin session through to a non-admin AUTH_ROUTES path", async () => {
    const jwt = await signSessionJwt({ uid: "user-1", email: "user@tapcash.online", admin: false });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard", jwt));

    expect(response.status).toBe(200);
  });

  it("rejects an invalid session JWT signed with the wrong secret", async () => {
    const wrongSecretJwt = await new SignJWT({ uid: "user-1", email: "a@b.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode("wrong-secret"));
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard", wrongSecretJwt));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });
});
