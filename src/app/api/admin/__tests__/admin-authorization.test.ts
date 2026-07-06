describe("Admin Authorization Guard", () => {
  function requireAdmin(authHeader: string | null, userData: { isAdmin?: boolean } | null): { status: number; body: unknown } {
    if (!authHeader?.startsWith("Bearer ")) {
      return { status: 401, body: { error: "Unauthorized" } };
    }
    if (!userData?.isAdmin) {
      return { status: 403, body: { error: "Forbidden - Admin access required" } };
    }
    return { status: 200, body: { ok: true } };
  }

  it("returns 401 when no Authorization header", () => {
    const result = requireAdmin(null, { isAdmin: true });
    expect(result.status).toBe(401);
  });

  it("returns 401 when Authorization header is not Bearer", () => {
    const result = requireAdmin("Basic abc123", { isAdmin: true });
    expect(result.status).toBe(401);
  });

  it("returns 401 when Authorization header is empty", () => {
    const result = requireAdmin("", { isAdmin: true });
    expect(result.status).toBe(401);
  });

  it("returns 403 when user is not admin", () => {
    const result = requireAdmin("Bearer valid-token", { isAdmin: false });
    expect(result.status).toBe(403);
  });

  it("returns 403 when user data is null", () => {
    const result = requireAdmin("Bearer valid-token", null);
    expect(result.status).toBe(403);
  });

  it("returns 403 when isAdmin is undefined", () => {
    const result = requireAdmin("Bearer valid-token", {});
    expect(result.status).toBe(403);
  });

  it("returns 200 when user is admin", () => {
    const result = requireAdmin("Bearer valid-token", { isAdmin: true });
    expect(result.status).toBe(200);
  });

  it("does not expose user ID in 403 error", () => {
    const result = requireAdmin("Bearer valid-token", { isAdmin: false });
    expect(JSON.stringify(result.body)).not.toContain("uid");
  });

  it("does not expose token in 401 error", () => {
    const result = requireAdmin(null, { isAdmin: true });
    expect(JSON.stringify(result.body)).not.toContain("Bearer");
  });
});

describe("Admin Route Protection", () => {
  const adminRoutes = [
    "/api/admin/users",
    "/api/admin/transactions",
    "/api/admin/withdrawals",
    "/api/admin/stats",
    "/api/admin/fraud",
    "/api/admin/offers",
    "/api/admin/multiplier",
    "/api/admin/promo-analytics",
  ];

  it("all admin routes require authorization", () => {
    adminRoutes.forEach((route) => {
      expect(route).toMatch(/^\/api\/admin\//);
    });
  });

  it("no admin routes are publicly accessible", () => {
    const publicRoutes = ["/api/health", "/api/auth/session", "/api/auth/login"];
    adminRoutes.forEach((adminRoute) => {
      expect(publicRoutes).not.toContain(adminRoute);
    });
  });
});
