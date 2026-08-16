import { execFile } from "child_process";
import { logger as baseLogger } from "./logger";

const logger = baseLogger.child({ service: "SecurityAudit" });

/**
 * Executes `npm audit --json` and logs a summary of the findings.
 * This function is intended to be run on a regular schedule (e.g., daily)
 * to provide continuous visibility into dependency vulnerabilities.
 */
export async function runSecurityAudit(): Promise<void> {
  return new Promise((resolve) => {
    // execFile (argument array, no shell) instead of exec (shell string) —
    // the command here is a fixed literal today, but exec's shell parsing
    // is a standing injection risk if this ever grows a dynamic argument.
    execFile("npm", ["audit", "--json"], { cwd: process.cwd() }, (error, stdout) => {
      // `npm audit` exits non-zero when it *finds* vulnerabilities — that's
      // not an execution failure, and stdout still holds the real report.
      // Only bail out if there's genuinely no output to parse.
      if (error && !stdout) {
        logger.error("Security audit failed to execute", error);
        resolve();
        return;
      }

      try {
        const auditResult = JSON.parse(stdout);
        const metadata = auditResult.metadata ?? {};
        const vulnerabilities = metadata.vulnerabilities ?? {};

        const total = vulnerabilities.total ?? 0;
        const high = vulnerabilities.high ?? 0;
        const moderate = vulnerabilities.moderate ?? 0;
        const low = vulnerabilities.low ?? 0;
        const info = vulnerabilities.info ?? 0;

        logger.info(
          `Security audit completed. Total vulnerabilities: ${total} (high: ${high}, moderate: ${moderate}, low: ${low}, info: ${info})`
        );

        if (high > 0) {
          logger.warn(`High severity vulnerabilities detected: ${high}`);
        }
      } catch (parseError) {
        logger.error("Failed to parse npm audit output", parseError);
      }

      resolve();
    });
  });
}
