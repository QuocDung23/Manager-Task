export const MailConfig = {
  apiKey: process.env.BREVO_API_KEY || "",
  apiUrl: "https://api.brevo.com/v3/smtp/email",
  senderAddress: process.env.MAIL_SENDER_ADDRESS || "",
  senderName: process.env.MAIL_SENDER_NAME || "No Reply",
};
