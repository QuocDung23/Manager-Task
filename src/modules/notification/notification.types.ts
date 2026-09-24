export enum NotificationType {
  TASK_DUE_SOON = "TASK_DUE_SOON",
  TASK_OVERDUE = "TASK_OVERDUE",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_COMPLETED = "TASK_COMPLETED",
}

export interface TaskDueSoonEmailParams {
  taskId: string;
  taskName: string;
  dueDate: Date;
  assigneeEmail: string;
  assigneeName: string;
}

export interface TaskOverdueEmailParams {
  taskId: string;
  taskName: string;
  dueDate: Date;
  lockedAt: Date;
  assigneeEmail: string;
  assigneeName: string;
}

export interface TaskAssigneeInfo {
  id: string;
  email: string;
  name: string;
}
