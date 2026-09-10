export const accountCleanupConfig = {
  cronExpression: process.env.PENDING_ACCOUNT_CLEANUP_CRON || "0 2 * * *",
  pendingAccountLifetimeMinutes:
    Number(process.env.PENDING_ACCOUNT_LIFETIME_MINUTES) || 1440,
};
