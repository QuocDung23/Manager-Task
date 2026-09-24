import { accountCleanupConfig } from "@/configs/account-cleanup.config";
import { AuthRepository } from "@/modules/auth/auth.repository";
import cron from "node-cron";

export const startAccountCleanupCron = () => {
  const authRepository = new AuthRepository();

  console.log(
    `[cron] Account cleanup scheduled with "${accountCleanupConfig.cronExpression}" and lifetime ${accountCleanupConfig.pendingAccountLifetimeMinutes} minute(s)`,
  );

  return cron.schedule(accountCleanupConfig.cronExpression, async () => {
    try {
      const cutoff = new Date(
        Date.now() -
          accountCleanupConfig.pendingAccountLifetimeMinutes * 60 * 1000,
      );
      const deletedCount =
        await authRepository.deleteExpiredPendingAccounts(cutoff);

      if (deletedCount > 0) {
        console.log(
          `[cron] Deleted ${deletedCount} unverified pending account(s)`,
        );
      }
    } catch (error) {
      console.error("[cron] Error deleting expired pending accounts", error);
    }
  });
};
