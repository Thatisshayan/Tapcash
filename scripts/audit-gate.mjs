#!/usr/bin/env node
/**
 * Audit gate for CI.
 *
 * `npm audit` runs against the whole lockfile, which — since the mobile app was
 * declared an npm workspace (needed for EAS Build to resolve shared/) — includes
 * the Expo / React Native / Metro build toolchain. Those advisories only have
 * semver-major fixes (Expo SDK + RN upgrade) and none of that code ships in the
 * deployed web app, so a plain `npm audit --audit-level=high` fails permanently
 * and takes the whole "Deploy to Production" workflow down with it.
 *
 * This gate keeps the audit hard-failing on anything real, while allowing a
 * short, dated, reviewable allowlist for the mobile build toolchain.
 *
 * Allowlist lives in .audit-allowlist.json. Every entry needs a reason and an
 * `expires` date — an expired entry fails the gate on purpose, so the debt gets
 * revisited instead of forgotten.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const FAIL_ON = new Set(['high', 'critical']);
const ALLOWLIST_PATH = new URL('../.audit-allowlist.json', import.meta.url);

function runAudit() {
  try {
    return execFileSync('npm', ['audit', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // npm audit exits non-zero when it finds vulnerabilities; that is expected.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return { allow: [] };
  return JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
}

function main() {
  const report = JSON.parse(runAudit());
  const vulnerabilities = report.vulnerabilities ?? {};
  const { allow = [] } = loadAllowlist();

  const allowed = new Map(allow.map((entry) => [entry.package, entry]));
  const today = new Date().toISOString().slice(0, 10);

  const blocking = [];
  const waived = [];
  const expired = [];

  for (const [name, vuln] of Object.entries(vulnerabilities)) {
    if (!FAIL_ON.has(vuln.severity)) continue;

    const waiver = allowed.get(name);
    if (!waiver) {
      blocking.push({ name, severity: vuln.severity });
      continue;
    }
    if (waiver.expires && waiver.expires < today) {
      expired.push({ name, severity: vuln.severity, expires: waiver.expires });
      continue;
    }
    waived.push({ name, severity: vuln.severity, expires: waiver.expires });
  }

  const counts = report.metadata?.vulnerabilities ?? {};
  console.log(
    `npm audit: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
      `${counts.moderate ?? 0} moderate, ${counts.low ?? 0} low`,
  );

  if (waived.length) {
    console.log(`\nWaived (mobile build toolchain, see .audit-allowlist.json):`);
    for (const v of waived) console.log(`  - ${v.severity} ${v.name} (expires ${v.expires})`);
  }

  if (expired.length) {
    console.error(`\nExpired waivers — re-review or extend them:`);
    for (const v of expired) console.error(`  - ${v.severity} ${v.name} (expired ${v.expires})`);
  }

  if (blocking.length) {
    console.error(`\nBlocking advisories:`);
    for (const v of blocking) console.error(`  - ${v.severity} ${v.name}`);
    console.error(`\nRun \`npm audit\` locally for details, or add a dated waiver to .audit-allowlist.json.`);
  }

  if (blocking.length || expired.length) process.exit(1);

  console.log('\nAudit gate passed.');
}

main();
