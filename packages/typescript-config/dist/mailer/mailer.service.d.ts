import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendPasswordResetEmail(to: string, token: string): Promise<void>;
    private simulateEmail;
    private sendRealEmail;
}
//# sourceMappingURL=mailer.service.d.ts.map