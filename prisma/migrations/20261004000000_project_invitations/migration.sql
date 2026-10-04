CREATE TYPE "ProjectInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED', 'EXPIRED');

CREATE TABLE "projectInvitations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "invitee_id" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status" "ProjectInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projectInvitations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "projectInvitations_invitee_id_status_created_at_idx" ON "projectInvitations"("invitee_id", "status", "created_at");
CREATE INDEX "projectInvitations_project_id_status_idx" ON "projectInvitations"("project_id", "status");
CREATE UNIQUE INDEX "projectInvitations_one_pending_per_user_project" ON "projectInvitations"("project_id", "invitee_id") WHERE "status" = 'PENDING';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "projectMembers"
    WHERE "status" = 'active' AND "deleted_at" IS NULL
    GROUP BY "project_id", "user_id" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate active project memberships must be resolved before applying project invitations migration';
  END IF;
END $$;
CREATE UNIQUE INDEX "projectMembers_one_active_per_user_project" ON "projectMembers"("project_id", "user_id") WHERE "status" = 'active' AND "deleted_at" IS NULL;

ALTER TABLE "projectInvitations" ADD CONSTRAINT "projectInvitations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projectInvitations" ADD CONSTRAINT "projectInvitations_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projectInvitations" ADD CONSTRAINT "projectInvitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projectInvitations" ADD CONSTRAINT "projectInvitations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
