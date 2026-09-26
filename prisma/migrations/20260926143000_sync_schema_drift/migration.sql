-- CreateEnum
CREATE TYPE "TaskLockStatus" AS ENUM ('unlocked', 'overdue_locked', 'manual_locked');

-- CreateEnum
CREATE TYPE "TaskScheduleEventType" AS ENUM ('scheduled', 'rescheduled', 'schedule_cleared', 'reminder_sent', 'overdue_locked', 'unlocked', 'completed');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "completed_at" TIMESTAMP(3),
ADD COLUMN "lock_reason" TEXT,
ADD COLUMN "lock_status" "TaskLockStatus" NOT NULL DEFAULT 'unlocked',
ADD COLUMN "locked_at" TIMESTAMP(3),
ADD COLUMN "overdue_notified_at" TIMESTAMP(3),
ADD COLUMN "reminder_at" TIMESTAMP(3),
ADD COLUMN "reminder_sent_at" TIMESTAMP(3),
ADD COLUMN "reschedule_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "statusAction" "TaskStatusAction" NOT NULL DEFAULT 'todo';

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN "deleteAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT 'https://ui-avatars.com/api/?name=User&background=3498DB&color=fff&size=256';

-- CreateTable
CREATE TABLE "taskScheduleEvents" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "type" "TaskScheduleEventType" NOT NULL,
    "old_due_date" TIMESTAMP(3),
    "new_due_date" TIMESTAMP(3),
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taskScheduleEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_normalized" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#64748b',
    "status" "TagStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskTags" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "taskTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskAssignments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "taskAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskComments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_comment_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "taskComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "taskScheduleEvents_task_id_created_at_idx" ON "taskScheduleEvents"("task_id", "created_at");

-- CreateIndex
CREATE INDEX "taskScheduleEvents_actor_id_idx" ON "taskScheduleEvents"("actor_id");

-- CreateIndex
CREATE INDEX "tags_board_id_deleted_at_idx" ON "tags"("board_id", "deleted_at");

-- CreateIndex
CREATE INDEX "tags_status_idx" ON "tags"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tags_board_id_name_normalized_key" ON "tags"("board_id", "name_normalized");

-- CreateIndex
CREATE INDEX "taskTags_task_id_deleted_at_idx" ON "taskTags"("task_id", "deleted_at");

-- CreateIndex
CREATE INDEX "taskTags_tag_id_deleted_at_idx" ON "taskTags"("tag_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "taskTags_task_id_tag_id_key" ON "taskTags"("task_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "taskAssignments_task_id_user_id_key" ON "taskAssignments"("task_id", "user_id");

-- CreateIndex
CREATE INDEX "taskComments_task_id_parent_comment_id_deleted_at_created_a_idx" ON "taskComments"("task_id", "parent_comment_id", "deleted_at", "created_at");

-- CreateIndex
CREATE INDEX "taskComments_parent_comment_id_deleted_at_created_at_idx" ON "taskComments"("parent_comment_id", "deleted_at", "created_at");

-- CreateIndex
CREATE INDEX "taskComments_user_id_idx" ON "taskComments"("user_id");

-- CreateIndex
CREATE INDEX "tasks_due_date_deleted_at_idx" ON "tasks"("due_date", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_lock_status_due_date_idx" ON "tasks"("lock_status", "due_date");

-- CreateIndex
CREATE INDEX "tasks_reminder_sent_at_due_date_idx" ON "tasks"("reminder_sent_at", "due_date");

-- AddForeignKey
ALTER TABLE "taskScheduleEvents" ADD CONSTRAINT "taskScheduleEvents_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskScheduleEvents" ADD CONSTRAINT "taskScheduleEvents_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskTags" ADD CONSTRAINT "taskTags_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskTags" ADD CONSTRAINT "taskTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskAssignments" ADD CONSTRAINT "taskAssignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskAssignments" ADD CONSTRAINT "taskAssignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskAssignments" ADD CONSTRAINT "taskAssignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskComments" ADD CONSTRAINT "taskComments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskComments" ADD CONSTRAINT "taskComments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskComments" ADD CONSTRAINT "taskComments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "taskComments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
