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
 * The check runs in a plain child Node process (outside Jest's module
 * resolver and mocks) with require(esm) disabled, so it fails on any Node
 * version if the ESM-only chain comes back.
 */
import { execFileSync } from "child_process";
import path from "path";

const repoRoot = path.resolve(__dirname, "../../..");

const probe = `
const fs = require("fs");
const path = require("path");
const adminDir = path.join(process.cwd(), "node_modules", "firebase-admin");
const jwksEntry = require.resolve("jwks-rsa", { paths: [adminDir] });
let dir = path.dirname(jwksEntry);
while (!fs.existsSync(path.join(dir, "package.json"))) dir = path.dirname(dir);
const version = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")).version;
const jwks = require(jwksEntry);
if (typeof jwks !== "function") throw new Error("jwks-rsa export is not a function");
process.stdout.write(JSON.stringify({ version }));
`;

describe("firebase-admin dependency chain loads without require(esm)", () => {
  it("loads firebase-admin's jwks-rsa (3.x) with --no-experimental-require-module", () => {
    const out = execFileSync(
      process.execPath,
      ["--no-experimental-require-module", "-e", probe],
      { cwd: repoRoot, encoding: "utf8" }
    );
    const { version } = JSON.parse(out) as { version: string };
    expect(version.startsWith("3.")).toBe(true);
  });
});
