/**
 * Regression test for the production outage that began 2026-08-06.
 *
 * firebase-admin loads jwks-rsa with require(). jwks-rsa 4.x in turn
 * require()s jose 6, which ships only as an ES module. On runtimes where
 * require() of ES modules is unavailable, every route that imports
 * firebase-admin/auth crashed with ERR_REQUIRE_ESM (sign-in, /api/health,
 * cron). package.json "overrides" pins firebase-admin's jwks-rsa to 3.2.2,
 * which depends on jose 4 (ships CommonJS).
 *
 * The test loads jwks-rsa in a child Node process with require(esm)
 * disabled, so it fails on any Node version if the ESM-only chain returns.
 */
import { execFileSync } from "child_process";
import path from "path";

const repoRoot = path.resolve(__dirname, "../../..");

function resolveFromFirebaseAdmin(request: string): string {
  const firebaseAdminDir = path.dirname(
    require.resolve("firebase-admin/package.json", { paths: [repoRoot] })
  );
  return require.resolve(request, { paths: [firebaseAdminDir] });
}

describe("firebase-admin dependency chain loads without require(esm)", () => {
  it("resolves jwks-rsa 3.x for firebase-admin", () => {
    const pkgPath = resolveFromFirebaseAdmin("jwks-rsa/package.json");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { version } = require(pkgPath) as { version: string };
    expect(version.startsWith("3.")).toBe(true);
  });

  it("can require jwks-rsa with --no-experimental-require-module", () => {
    const jwksPath = resolveFromFirebaseAdmin("jwks-rsa");
    const script = `const jwks = require(${JSON.stringify(jwksPath)});
      if (typeof jwks !== "function") { throw new Error("jwks-rsa export is not a function"); }
      process.stdout.write("ok");`;
    const out = execFileSync(
      process.execPath,
      ["--no-experimental-require-module", "-e", script],
      { encoding: "utf8" }
    );
    expect(out).toBe("ok");
  });
});
