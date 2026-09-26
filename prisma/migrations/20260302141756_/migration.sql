-- CreateEnum
CREATE TYPE "ProjectMemberStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('MANAGE_USERS', 'MANAGE_SYSTEM', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'VIEW_USER', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'VIEW_PROJECT');

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "deleted_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RoleStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userRoles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "userRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "permission_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "PermissionStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolePermissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "rolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectMembers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status" "ProjectMemberStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projectMembers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "userRoles_user_id_role_id_key" ON "userRoles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE UNIQUE INDEX "rolePermissions_role_id_permission_id_key" ON "rolePermissions"("role_id", "permission_id");

-- AddForeignKey
ALTER TABLE "userRoles" ADD CONSTRAINT "userRoles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userRoles" ADD CONSTRAINT "userRoles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissions" ADD CONSTRAINT "rolePermissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermissions" ADD CONSTRAINT "rolePermissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectMembers" ADD CONSTRAINT "projectMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectMembers" ADD CONSTRAINT "projectMembers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectMembers" ADD CONSTRAINT "projectMembers_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
