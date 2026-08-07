import { exec } from "child_process";
import { Logger } from "./logger";

const logger = new Logger("SecurityAudit");

/**
 * Executes `npm audit --json` and logs a summary of the findings.
 * This function is intended to be run on a regular schedule (e.g., daily)
 * to provide continuous visibility into dependency vulnerabilities.
 */
export async function runSecurityAudit(): Promise<void> {
  return new Promise((resolve) => {
    exec("npm audit --json", { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
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
