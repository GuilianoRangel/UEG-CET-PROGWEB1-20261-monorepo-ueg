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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./guards/local-auth.guard");
const users_service_1 = require("../users/users.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const mailer_service_1 = require("../mailer/mailer.service");
const recovery_service_1 = require("./recovery.service");
const business_exception_1 = require("../common/exceptions/business.exception");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const bcrypt = __importStar(require("bcrypt"));
let AuthController = class AuthController {
    authService;
    usersService;
    mailerService;
    recoveryService;
    constructor(authService, usersService, mailerService, recoveryService) {
        this.authService = authService;
        this.usersService = usersService;
        this.mailerService = mailerService;
        this.recoveryService = recoveryService;
    }
    async register(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async login(req) {
        if (!req.user) {
            throw new business_exception_1.BusinessException('Usuário não autenticado', 'AUTH_UNAUTHORIZED');
        }
        return this.authService.login(req.user);
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const token = this.recoveryService.generateToken(email);
            await this.mailerService.sendPasswordResetEmail(email, token);
        }
        return {
            message: 'Se o e-mail existir, um link de recuperação será enviado.',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const email = this.recoveryService.validateToken(token);
        if (!email) {
            throw new business_exception_1.BusinessException('Token inválido ou expirado', 'AUTH_INVALID_TOKEN');
        }
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const hash = await bcrypt.hash(newPassword, 10);
            await this.usersService.updatePassword(user.id, hash);
            this.recoveryService.deleteToken(token);
        }
        return { message: 'Senha redefinida com sucesso.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService,
        mailer_service_1.MailerService,
        recovery_service_1.RecoveryService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map