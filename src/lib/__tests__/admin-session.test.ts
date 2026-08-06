import { NextRequest } from "next/server";

const SECRET = "test-admin-session-secret";

async function makeRequestWithCookie(cookieValue: string | undefined): Promise<NextRequest> {
  const headers = new Headers();
  if (cookieValue !== undefined) {
    headers.set("cookie", `admin_session=${cookieValue}`);
  }
  return new NextRequest("http://localhost/api/admin/stats", { headers });
}

async function signAdminJwt(payload: Record<string, unknown>, secret = SECRET): Promise<string> {
  const { SignJWT } = await import("jose");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(secret));
}

describe("requireAdminSession", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.SESSION_SECRET = originalSecret;
    jest.resetModules();
  });

  it("returns uid and email for a valid admin session cookie", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "admin-uid-1", email: "admin@tapcash.online", admin: true });
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("uid" in result).toBe(true);
    if ("uid" in result) {
      expect(result.uid).toBe("admin-uid-1");
      expect(result.email).toBe("admin@tapcash.online");
    }
  });

  it("rejects with 401 when no admin_session cookie is present", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const request = await makeRequestWithCookie(undefined);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects with 403 when the session is valid but admin claim is false", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "user-uid-1", email: "user@tapcash.online", admin: false });
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(403);
    }
  });

  it("rejects with 401 when the JWT is signed with the wrong secret", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "admin-uid-1", email: "a@b.com", admin: true }, "wrong-secret");
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects with 500 when SESSION_SECRET is not configured", async () => {
    delete process.env.SESSION_SECRET;
    const { requireAdminSession } = await import("../admin-session");
    const request = await makeRequestWithCookie("irrelevant-value");

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(500);
    }
  });
});
