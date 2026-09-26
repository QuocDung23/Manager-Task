-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "TaskStatusAction" AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'paused', 'fixed', 'cancelled');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderTask" INTEGER NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "list_id" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
