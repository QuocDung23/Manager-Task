import type { Prisma, TaskActivityType } from "@prisma/client";

export type TaskActivityActor = {
  id: string;
  name: string;
  avatar: string | null;
};

export type TaskActivityResponse = {
  id: string;
  taskId: string;
  type: TaskActivityType;
  actor: TaskActivityActor | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type CreateTaskActivityInput = {
  taskId: string;
  actorId?: string | null;
  type: TaskActivityType;
  metadata?: Prisma.InputJsonValue;
  dedupeKey?: string | null;
};
