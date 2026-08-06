// src/lib/__tests__/firebaseAdmin.test.ts
//
// jest.setup.ts globally mocks @/lib/firebaseAdmin with a fixed stub object
// (no firebaseAdminMode/firebaseAdminReady/firebaseAdminError fields) -- this
// file specifically tests the real module's init-time behavior across
// several env-var scenarios, so it un-mocks it for itself only (per-file,
// via jest.unmock; no other test file is affected). Precedent:
// src/lib/__tests__/admin-session.test.ts un-mocks next/server the same way.
jest.unmock("@/lib/firebaseAdmin");

import { setNodeEnv } from "../testHelpers/testEnv";

describe("firebaseAdmin module initialization", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it("initializes in fallback mode in a non-production env with no credentials configured", async () => {
    setNodeEnv("test");
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.firebaseAdminMode).toBe("fallback");
    expect(mod.firebaseAdminReady).toBe(false);
    expect(mod.firebaseAdminError).toContain("Missing");
  });

  it("exposes adminDb and adminAuth even in fallback mode (module stays importable)", async () => {
    setNodeEnv("test");
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.adminDb).toBeDefined();
    expect(mod.adminAuth).toBeDefined();
  });

  it("sets firebaseAdminError with a descriptive message when credentials are partially configured", async () => {
    setNodeEnv("test");
    process.env.FIREBASE_CLIENT_EMAIL = "test@example.iam.gserviceaccount.com";
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.firebaseAdminMode).toBe("fallback");
    expect(mod.firebaseAdminError).toMatch(/FIREBASE_PRIVATE_KEY|FIREBASE_PROJECT_ID/);
  });
});
