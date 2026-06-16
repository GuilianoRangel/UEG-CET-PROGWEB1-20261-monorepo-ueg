import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<Omit<User, 'senha'> | null>;
    login(user: Omit<User, 'senha'>): Promise<{
        access_token: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map