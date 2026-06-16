"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const business_exception_1 = require("../common/exceptions/business.exception");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new business_exception_1.BusinessException('E-mail já está em uso', 'AUTH_EMAIL_EXISTS');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);
        const user = this.userRepository.create({
            ...createUserDto,
            senha: hashedPassword,
            ativo: false,
            role: user_entity_1.Role.USER,
        });
        return this.userRepository.save(user);
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new business_exception_1.BusinessException('Usuário não encontrado', 'USER_NOT_FOUND');
        }
        return user;
    }
    async findAll() {
        return this.userRepository.find({
            select: [
                'id',
                'email',
                'nome',
                'ativo',
                'role',
                'createdAt',
                'updatedAt',
            ],
        });
    }
    async activate(id) {
        const user = await this.findById(id);
        user.ativo = true;
        return this.userRepository.save(user);
    }
    async updatePassword(id, novaSenhaHash) {
        const user = await this.findById(id);
        user.senha = novaSenhaHash;
        return this.userRepository.save(user);
    }
    async createAdmin(email, nome, senha) {
        const existing = await this.userRepository.findOne({ where: { email } });
        if (existing) {
            return existing;
        }
        const hashedPassword = await bcrypt.hash(senha, 10);
        const admin = this.userRepository.create({
            email,
            nome,
            senha: hashedPassword,
            ativo: true,
            role: user_entity_1.Role.ADMIN,
        });
        return this.userRepository.save(admin);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map