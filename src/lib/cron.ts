import { CronJob } from "cron";
import { runSecurityAudit } from "./securityAudit";

/**
 * Schedules a daily security audit at 00:00 UTC.
 * The job runs `runSecurityAudit` and logs any unexpected errors.
 */
const dailySecurityAuditJob = new CronJob(
  "0 0 * * *", // Every day at midnight UTC
  async () => {
    try {
      await runSecurityAudit();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Unexpected error during scheduled security audit:", e);
    }
  },
  null,
  false,
  "UTC"
);

// Not started on import — call startDailySecurityAudit() from the server
// bootstrap path. Starting at module scope would schedule the job as a
// side effect of any import (tests, dev hot-reload, unrelated bundles).
export function startDailySecurityAudit(): void {
  dailySecurityAuditJob.start();
}

export default dailySecurityAuditJob;
