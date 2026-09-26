-- Add assignmentVersion column to tasks table
ALTER TABLE "tasks" ADD COLUMN "assignment_version" INTEGER NOT NULL DEFAULT 0;
