export interface MailAddress {
	name?: string;
	address: string;
}

export class SendEmailDto {
	sender?: MailAddress;
	recipients: MailAddress[];
	subject: string;
	html: string;
	text?: string;
}
