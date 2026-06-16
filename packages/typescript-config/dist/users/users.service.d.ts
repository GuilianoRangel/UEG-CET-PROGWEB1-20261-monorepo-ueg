import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    findAll(): Promise<User[]>;
    activate(id: string): Promise<User>;
    updatePassword(id: string, novaSenhaHash: string): Promise<User>;
    createAdmin(email: string, nome: string, senha: string): Promise<User>;
}
//# sourceMappingURL=users.service.d.ts.map