import { TaskStatus, TaskStatusAction } from "@prisma/client"
import z from "zod"

type TaskAssignmentLite = {
    id: string;
    taskId: string;
    userId: string;
    assignedById: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export class TaskResponseDto {
    id: string
    name: string
    description?: string
    orderTask: number
    dueDate?: Date
    listId: string
    assign: string[]
    status: TaskStatus
    statusAction: TaskStatusAction

    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null

    constructor(
        data:
            | TaskResponseDto
            | (TaskResponseDto & { taskAssignments?: TaskAssignmentLite[] }),
    ) {
        this.id = data.id
        this.name = data.name
        this.description = data.description
        this.orderTask = data.orderTask
        this.dueDate = data.dueDate
        this.listId = data.listId
        this.status = data.status
        this.statusAction = data.statusAction

        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
        this.deletedAt = data.deletedAt

        const fromData = (data as TaskResponseDto).assign;
        if (Array.isArray(fromData) && fromData.length > 0) {
            this.assign = fromData;
        } else {
            const assignments = (data as { taskAssignments?: TaskAssignmentLite[] })
                .taskAssignments;
            this.assign = Array.isArray(assignments)
                ? assignments.map((a) => a.userId)
                : [];
        }
    }
}

export const taskResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    orderTask: z.number().int(),
    dueDate: z.date().optional(),
    listId: z.string().uuid(),
    assign: z.array(z.string().uuid()),
    status: z.enum(TaskStatus),
    statusAction: z.enum(TaskStatusAction),

    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
})

// Response trả về cho endpoint move / reorder task.
// - movedTask: task vừa được move với listId, orderTask mới.
// - sourceTasks: task còn lại trong list nguồn (có thể rỗng nếu move trong cùng list).
// - targetTasks: task trong list đích sau khi reorder.
export class MoveTaskResponseDto {
    movedTask: TaskResponseDto;
    sourceTasks: TaskResponseDto[];
    targetTasks: TaskResponseDto[];

    constructor(data: MoveTaskResponseDto) {
        this.movedTask = data.movedTask;
        this.sourceTasks = data.sourceTasks;
        this.targetTasks = data.targetTasks;
    }
}

export const moveTaskResponseSchema = z.object({
    movedTask: taskResponseSchema,
    sourceTasks: z.array(taskResponseSchema),
    targetTasks: z.array(taskResponseSchema),
})