import { createTransport } from "nodemailer";

export const MailConfig = {
  host: String(process.env.MAIL_HOST),
  port: Number(process.env.MAIL_PORT) || 587,
  user: String(process.env.MAIL_USER),
  pass: String(process.env.MAIL_PASS),
  senderAddress: String(process.env.MAIL_SENDER_ADDRESS) || "",
  senderName: String(process.env.MAIL_SENDER_NAME) || "No Reply",
};

export const MailTransportConfig = createTransport({
  host: MailConfig.host,
  port: MailConfig.port,
  secure: false,
  auth: {
    user: MailConfig.user,
    pass: MailConfig.pass,
  },
});
