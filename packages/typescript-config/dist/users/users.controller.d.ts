import { UsersService } from './users.service';
import { RecoveryService } from '../auth/recovery.service';
import { MailerService } from '../mailer/mailer.service';
export declare class UsersController {
    private readonly usersService;
    private readonly recoveryService;
    private readonly mailerService;
    private readonly logger;
    constructor(usersService: UsersService, recoveryService: RecoveryService, mailerService: MailerService);
    findAll(): Promise<import("./entities/user.entity").User[]>;
    activate(id: string): Promise<import("./entities/user.entity").User>;
    resetPassword(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map