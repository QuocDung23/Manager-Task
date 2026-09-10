import {
  BoardPermissions,
  ListPermissions,
  ProjectPermissions,
  TaskPermissions,
  UserPermissions,
} from "@/common/enums/permissions";
import { BoardRole, ProjectRole, UserRole } from "@/common/enums/roles";
import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const allPermissions = [
  ...Object.values(UserPermissions),
  ...Object.values(ProjectPermissions),
  ...Object.values(BoardPermissions),
  ...Object.values(ListPermissions),
  ...Object.values(TaskPermissions),
];

const memberTaskPermissions = Object.values(TaskPermissions).filter(
  (permission) => permission !== TaskPermissions.UNLOCK_TASK,
);

const rolePermissionMap: Record<string, readonly string[]> = {
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(UserPermissions),
    ...Object.values(ProjectPermissions),
    ...Object.values(BoardPermissions),
    ...Object.values(ListPermissions),
    ...Object.values(TaskPermissions),
  ],
  [UserRole.USER]: [UserPermissions.CREATE_PROJECT, UserPermissions.VIEW_USER],

  [ProjectRole.PROJECT_ADMIN]: [
    ProjectPermissions.UPDATE_PROJECT,
    ProjectPermissions.DELETE_PROJECT,
    ProjectPermissions.VIEW_PROJECT,
    ProjectPermissions.ADD_MEMBER_PROJECT,
    ProjectPermissions.REMOVE_MEMBER_PROJECT,
    ProjectPermissions.UPDATE_ROLE_MEMBER_PROJECT,
    ProjectPermissions.CREATE_BOARD,

    ...Object.values(BoardPermissions),
    ...Object.values(ListPermissions),
    ...Object.values(TaskPermissions),
  ],
  [ProjectRole.PROJECT_MEMBER]: [
    ProjectPermissions.VIEW_PROJECT,
    ProjectPermissions.CREATE_BOARD,
    ProjectPermissions.VIEW_BOARD,

    ...Object.values(ListPermissions),
    ...memberTaskPermissions,
  ],

  [BoardRole.BOARD_ADMIN]: [
    BoardPermissions.UPDATE_BOARD,
    BoardPermissions.DELETE_BOARD,
    BoardPermissions.VIEW_BOARD,
    BoardPermissions.ADD_MEMBER_BOARD,
    BoardPermissions.REMOVE_MEMBER_BOARD,
    BoardPermissions.UPDATE_ROLE_MEMBER_BOARD,
    BoardPermissions.CREATE_LIST,

    ...Object.values(ListPermissions),
    ...Object.values(TaskPermissions),
  ],
  [BoardRole.BOARD_MEMBER]: [
    BoardPermissions.VIEW_BOARD,
    BoardPermissions.CREATE_LIST,

    ListPermissions.CREAT_TASK,
    ListPermissions.VIEW_LIST,
    ListPermissions.UPDATE_LIST,

    TaskPermissions.VIEW_TASK,
    TaskPermissions.UPDATE_TASK,
    TaskPermissions.MOVE_TASK,
    TaskPermissions.CREATE_TASK_TAG,
    TaskPermissions.UPDATE_TASK_TAG,
    TaskPermissions.DELETE_TASK_TAG,
    TaskPermissions.ASSIGN_TASK_TAG,
    TaskPermissions.UNASSIGN_TASK_TAG,
    TaskPermissions.CREATE_TASK_COMMENT,
    TaskPermissions.UPDATE_TASK_COMMENT,
    TaskPermissions.DELETE_TASK_COMMENT,
    TaskPermissions.UPDATE_TASK_STATUS_ACTION,
    TaskPermissions.SCHEDULE_TASK,
    TaskPermissions.RESCHEDULE_TASK,
    TaskPermissions.CLEAR_TASK_SCHEDULE,
    TaskPermissions.COMPLETE_TASK,
  ],
};

const ROLE_PERMISSIONS = Array.from(
  new Set([...allPermissions, ...Object.values(rolePermissionMap).flat()]),
);

async function main() {
  console.log("Seeding data...");

  // 1. Tạo tất cả permissions theo danh sách trong code
  for (const name of ROLE_PERMISSIONS) {
    await prisma.permissions.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `Permission: ${name}`,
      },
    });
  }
  console.log("All permissions have been initialized.");

  // 2. Tạo tất cả roles (system + project)
  const allRoles = [
    ...Object.values(UserRole),
    ...Object.values(ProjectRole),
    ...Object.values(BoardRole),
  ];
  for (const role of allRoles) {
    await prisma.roles.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
        description: `Role: ${role}`,
      },
    });
  }
  console.log("All roles have been initialized.");

  // 3. Gán permission cho từng role
  for (const [roleName, perms] of Object.entries(rolePermissionMap)) {
    const role = await prisma.roles.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      console.warn(`Role not found: ${roleName}, skip.`);
      continue;
    }

    for (const permName of perms) {
      const permission = await prisma.permissions.findUnique({
        where: { name: permName },
      });
      if (!permission) {
        console.warn(`Permission not found: ${permName}, skip.`);
        continue;
      }

      await prisma.rolePermissions.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log("Role-permission mapping has been assigned.");

  // 4. Tạo tài khoản super admin (nếu chưa có)
  const superAdminEmail = "admin@gmail.com";
  let superAdminUser = await prisma.users.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdminUser) {
    superAdminUser = await prisma.users.create({
      data: {
        name: "System Admin",
        email: superAdminEmail,
        verify: true,
        status: UserStatus.ACTIVE,
        accounts: {
          create: {
            password: "123123",
            salt: "123123",
          },
        },
      },
    });
    console.log(`Created super admin user: ${superAdminEmail}`);
  } else {
    console.log(`Super admin user already exists: ${superAdminEmail}`);
  }

  const superAdminRole = await prisma.roles.findUnique({
    where: { name: UserRole.SUPER_ADMIN },
  });
  if (superAdminRole) {
    await prisma.userRoles.upsert({
      where: {
        userId_roleId: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    });
    console.log("Super admin role assigned.");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
