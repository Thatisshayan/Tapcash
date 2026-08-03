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

// Start the job as soon as this module is imported.
dailySecurityAuditJob.start();

export default dailySecurityAuditJob;
