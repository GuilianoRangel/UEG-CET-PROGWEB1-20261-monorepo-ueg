import { OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
export declare class SeedService implements OnModuleInit {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    onModuleInit(): Promise<void>;
    private seedAdmin;
}
//# sourceMappingURL=seed.d.ts.map