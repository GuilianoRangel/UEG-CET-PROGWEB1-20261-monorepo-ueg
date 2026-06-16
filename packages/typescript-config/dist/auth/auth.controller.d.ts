import * as express from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailerService } from '../mailer/mailer.service';
import { RecoveryService } from './recovery.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    private readonly mailerService;
    private readonly recoveryService;
    constructor(authService: AuthService, usersService: UsersService, mailerService: MailerService, recoveryService: RecoveryService);
    register(createUserDto: CreateUserDto): Promise<User>;
    login(req: express.Request): Promise<{
        access_token: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map