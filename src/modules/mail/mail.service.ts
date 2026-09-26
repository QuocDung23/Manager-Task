import { MailConfig } from "@/configs/mail.config";
import { SendEmailDto } from "./dtos";

export class MailService {
    constructor(
    ) {}

    async sendMail(data: SendEmailDto): Promise<{success: boolean} | null> {
        const {sender, recipients, subject, html, text}: SendEmailDto = data;

        if (!MailConfig.apiKey) {
            throw new Error("BREVO_API_KEY is not set");
        }
        if (!MailConfig.senderAddress) {
            throw new Error("MAIL_SENDER_ADDRESS is not set");
        }

        const from = sender ?? {
            address: MailConfig.senderAddress,
            name: MailConfig.senderName,
        };

        const response = await fetch(MailConfig.apiUrl, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": MailConfig.apiKey,
            },
            body: JSON.stringify({
                sender: {
                    email: from.address,
                    name: from.name || MailConfig.senderName,
                },
                to: recipients.map((recipient) => ({
                    email: recipient.address,
                    name: recipient.name,
                })),
                subject,
                htmlContent: html,
                textContent: text,
            }),
            signal: AbortSignal.timeout(15_000),
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Brevo mail failed (${response.status}): ${body}`);
        }

        return {success: true}
    }
}
