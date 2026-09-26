-- CreateEnum
CREATE TYPE "TaskActivityType" AS ENUM (
  'TASK_CREATED',
  'TASK_NAME_CHANGED',
  'TASK_DESCRIPTION_CHANGED',
  'TASK_ASSIGNEE_ADDED',
  'TASK_ASSIGNEE_REMOVED',
  'TASK_TAG_ADDED',
  'TASK_TAG_REMOVED',
  'TASK_SCHEDULE_SET',
  'TASK_RESCHEDULED',
  'TASK_SCHEDULE_CLEARED',
  'TASK_DUE_SOON',
  'TASK_OVERDUE_LOCKED',
  'TASK_UNLOCKED',
  'TASK_STATUS_CHANGED'
);

CREATE TYPE "NotificationPriority" AS ENUM ('NORMAL', 'DIRECT', 'URGENT');

CREATE TABLE "taskActivities" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "type" "TaskActivityType" NOT NULL,
  "metadata" JSONB,
  "dedupe_key" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "taskActivities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "recipient_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "type" TEXT NOT NULL,
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "project_id" TEXT,
  "board_id" TEXT,
  "task_id" TEXT,
  "comment_id" TEXT,
  "data" JSONB,
  "dedupe_key" TEXT NOT NULL,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "taskActivities_task_id_dedupe_key_key"
  ON "taskActivities"("task_id", "dedupe_key");
CREATE INDEX "taskActivities_task_id_created_at_id_idx"
  ON "taskActivities"("task_id", "created_at", "id");
CREATE UNIQUE INDEX "notifications_recipient_id_dedupe_key_key"
  ON "notifications"("recipient_id", "dedupe_key");
CREATE INDEX "notifications_recipient_id_created_at_id_idx"
  ON "notifications"("recipient_id", "created_at", "id");
CREATE INDEX "notifications_recipient_id_read_at_created_at_idx"
  ON "notifications"("recipient_id", "read_at", "created_at");

ALTER TABLE "taskActivities"
  ADD CONSTRAINT "taskActivities_task_id_fkey" FOREIGN KEY ("task_id")
  REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "taskActivities"
  ADD CONSTRAINT "taskActivities_actor_id_fkey" FOREIGN KEY ("actor_id")
  REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id")
  REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id")
  REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
