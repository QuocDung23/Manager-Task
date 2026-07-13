export const taskScheduleConfig = {
  cronExpression: process.env.TASK_SCHEDULE_CRON || "* * * * *",
  reminderBeforeMinutes:
    Number(process.env.TASK_REMINDER_BEFORE_MINUTES) || 30,
  lockGraceMinutes:
    Number(process.env.TASK_OVERDUE_LOCK_GRACE_MINUTES) || 0,
  batchSize: Number(process.env.TASK_SCHEDULE_BATCH_SIZE) || 100,
};
