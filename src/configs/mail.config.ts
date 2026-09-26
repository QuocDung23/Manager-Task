import { lookup } from "node:dns/promises";
import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export const MailConfig = {
  host: String(process.env.MAIL_HOST),
  port: Number(process.env.MAIL_PORT) || 587,
  user: String(process.env.MAIL_USER),
  pass: String(process.env.MAIL_PASS),
  senderAddress: String(process.env.MAIL_SENDER_ADDRESS) || "",
  senderName: String(process.env.MAIL_SENDER_NAME) || "No Reply",
};

export const MailTransportConfig = {
  async sendMail(mail: Mail.Options) {
    const { address } = await lookup(MailConfig.host, 4);
    const transport = createTransport({
      host: address,
      port: MailConfig.port,
      secure: false,
      tls: { servername: MailConfig.host },
      auth: {
        user: MailConfig.user,
        pass: MailConfig.pass,
      },
    });
    try {
      return await transport.sendMail(mail);
    } finally {
      transport.close();
    }
  },
};
