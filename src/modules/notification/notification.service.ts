import { MailService } from "@/modules/mail/mail.service";
import { MailConfig } from "@/configs/mail.config";
import {
  NotificationType,
  TaskDueSoonEmailParams,
  TaskOverdueEmailParams,
} from "./notification.types";

export class NotificationService {
  private mailService = new MailService();

  async sendTaskDueSoonEmail(params: TaskDueSoonEmailParams): Promise<void> {
    const { taskId, taskName, dueDate, assigneeEmail, assigneeName } = params;

    console.log(`[notification] Preparing email for task ${taskId}, assignee: ${assigneeEmail}`);

    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const timeRemaining =
      diffHours > 0
        ? `${diffHours} hour(s) ${diffMinutes} minute(s)`
        : `${diffMinutes} minute(s)`;

    const taskUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/tasks/${taskId}`;

    console.log(`[notification] MailConfig:`, {
      host: MailConfig.host,
      port: MailConfig.port,
      senderAddress: MailConfig.senderAddress,
      senderName: MailConfig.senderName,
    });

    try {
      const result = await this.mailService.sendMail({
        recipients: [
          {
            name: assigneeName,
            address: assigneeEmail,
          },
        ],
        subject: `⏰ Reminder: Task "${taskName}" is due soon!`,
        html: this.renderTaskDueSoonTemplate({
          taskName,
          dueDate: dueDate.toLocaleString("en-US"),
          timeRemaining,
          taskUrl,
          assigneeName,
        }),
      });

      console.log(
        `[notification] Email sent to ${assigneeEmail} for task ${taskId} (due soon)`,
        result,
      );
    } catch (error) {
      console.error(
        `[notification] Failed to send due soon email to ${assigneeEmail}:`,
        error,
      );
    }
  }

  async sendTaskOverdueEmail(params: TaskOverdueEmailParams): Promise<void> {
    const { taskId, taskName, dueDate, lockedAt, assigneeEmail, assigneeName } =
      params;

    const taskUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/tasks/${taskId}`;

    try {
      await this.mailService.sendMail({
        recipients: [
          {
            name: assigneeName,
            address: assigneeEmail,
          },
        ],
        subject: `🔴 Warning: Task "${taskName}" is overdue!`,
        html: this.renderTaskOverdueTemplate({
          taskName,
          dueDate: dueDate.toLocaleString("en-US"),
          lockedAt: lockedAt.toLocaleString("en-US"),
          taskUrl,
          assigneeName,
        }),
      });

      console.log(
        `[notification] Email sent to ${assigneeEmail} for task ${taskId} (overdue)`,
      );
    } catch (error) {
      console.error(
        `[notification] Failed to send overdue email to ${assigneeEmail}:`,
        error,
      );
    }
  }

  private renderTaskDueSoonTemplate(data: {
    taskName: string;
    dueDate: string;
    timeRemaining: string;
    taskUrl: string;
    assigneeName: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⏰ Reminder: Task Due Soon</h2>
        <p>Hello <strong>${data.assigneeName}</strong>,</p>
        <p>Your task deadline is approaching:</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${data.taskName}</h3>
          <p style="margin: 5px 0;"><strong>Deadline:</strong> ${data.dueDate}</p>
          <p style="margin: 5px 0;"><strong>Time Remaining:</strong> <span style="color: #dc2626; font-weight: bold;">${data.timeRemaining}</span></p>
        </div>
        <a href="${data.taskUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Task</a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">This email was sent automatically by the ManageTask system.</p>
      </div>
    `;
  }

  private renderTaskOverdueTemplate(data: {
    taskName: string;
    dueDate: string;
    lockedAt: string;
    taskUrl: string;
    assigneeName: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🔴 Warning: Task Overdue</h2>
        <p>Hello <strong>${data.assigneeName}</strong>,</p>
        <p>Your task is overdue and has been locked:</p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${data.taskName}</h3>
          <p style="margin: 5px 0;"><strong>Missed Deadline:</strong> ${data.dueDate}</p>
          <p style="margin: 5px 0;"><strong>Locked At:</strong> ${data.lockedAt}</p>
          <p style="margin: 5px 0; color: #dc2626;"><strong>Status:</strong> 🔒 Locked</p>
        </div>
        <p><strong>Instructions:</strong> To unlock the task, please reschedule (set a new deadline) or contact your manager.</p>
        <a href="${data.taskUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View and Reschedule Task</a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">This email was sent automatically by the ManageTask system.</p>
      </div>
    `;
  }
}

export const notificationService = new NotificationService();
