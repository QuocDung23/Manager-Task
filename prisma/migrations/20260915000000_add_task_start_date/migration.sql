-- AlterTable
ALTER TABLE "tasks"
  ADD COLUMN "start_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "tasks_start_date_deleted_at_idx" ON "tasks"("start_date", "deleted_at");
