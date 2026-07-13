import { taskScheduleConfig } from "@/configs";
import { TaskService } from "@/modules/tasks/task.service";
import cron from "node-cron";

export const startTaskScheduleCron = () => {
  const taskService = new TaskService();

  console.log(
    `[cron] Task schedule scheduled with "${taskScheduleConfig.cronExpression}", reminder ${taskScheduleConfig.reminderBeforeMinutes} minute(s) before due date, grace ${taskScheduleConfig.lockGraceMinutes} minute(s)`,
  );

  return cron.schedule(taskScheduleConfig.cronExpression, async () => {
    try {
      const now = new Date();
      const reminderCount = await taskService.processDueReminders(now);
      const lockedCount = await taskService.processOverdueLocks(now);

      if (reminderCount > 0 || lockedCount > 0) {
        console.log(
          `[cron] Task schedule processed reminder=${reminderCount}, locked=${lockedCount}`,
        );
      }
    } catch (error) {
      console.error("[cron] Error processing task schedule", error);
    }
  });
};
