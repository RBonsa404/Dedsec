interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailService {
    private readonly logger;
    private transporter;
    constructor();
    private initTransporter;
    sendMail(options: SendMailOptions): Promise<void>;
    sendWelcomeEmail(email: string, firstName: string, tempPassword: string): Promise<void>;
    sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void>;
}
export {};
