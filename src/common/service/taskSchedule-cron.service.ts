import { taskScheduleConfig } from "@/configs";
import { TaskService } from "@/modules/tasks/task.service";
import cron from "node-cron";

let isCronRunning = false;

export const startTaskScheduleCron = () => {
  const taskService = new TaskService();

  console.log(
    `[cron] Task schedule scheduled with "${taskScheduleConfig.cronExpression}", reminder ${taskScheduleConfig.reminderBeforeMinutes} minute(s) before due date, grace ${taskScheduleConfig.lockGraceMinutes} minute(s)`,
  );

  return cron.schedule(taskScheduleConfig.cronExpression, async () => {
    if (isCronRunning) {
      console.log("[cron] Previous job still running, skipping this run...");
      return;
    }

    isCronRunning = true;
    const startTime = Date.now();

    try {
      const now = new Date();
      const reminderCount = await taskService.processDueReminders(now);
      const lockedCount = await taskService.processOverdueLocks(now);

      const elapsedMs = Date.now() - startTime;
      if (reminderCount > 0 || lockedCount > 0) {
        console.log(
          `[cron] Task schedule processed reminder=${reminderCount}, locked=${lockedCount} (${elapsedMs}ms)`,
        );
      }
    } catch (error) {
      console.error("[cron] Error processing task schedule", error);
    } finally {
      isCronRunning = false;
    }
  });
};
