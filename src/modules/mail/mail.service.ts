import { MailConfig, MailTransportConfig } from "@/configs/mail.config";
import { SendEmailDto } from "./dtos";

export class MailService {
    constructor(
    ) {}

    async sendMail(data: SendEmailDto): Promise<{success: boolean} | null> {
        const {sender, recipients, subject, html, text}: SendEmailDto = data;

        await MailTransportConfig.sendMail({
            from: sender || {
                address: MailConfig.senderAddress,
                name: MailConfig.senderName
            },
            to: recipients,
            subject: subject,
            html: html,
            text: text
        })
        return {success: true}
    }
}