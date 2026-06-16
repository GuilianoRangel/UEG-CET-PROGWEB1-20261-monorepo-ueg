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
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const fs = __importStar(require("fs"));
let MailerService = MailerService_1 = class MailerService {
    configService;
    logger = new common_1.Logger(MailerService_1.name);
    transporter = null;
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        const isEmailDisabled = this.configService.get('EMAIL_DISABLED') === 'true';
        if (isEmailDisabled) {
            this.logger.log('Envio de e-mails desativado. Modo simulação ativo.');
            return;
        }
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
            port: Number(this.configService.get('SMTP_PORT')) || 587,
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER') || 'test@gmail.com',
                pass: this.configService.get('SMTP_PASS') || 'password',
            },
        });
    }
    async sendPasswordResetEmail(to, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:4200';
        const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;
        const from = '"Monorepo UEG" <noreply@ueg.br>';
        const subject = 'Recuperação de Senha';
        const text = `Para redefinir sua senha, clique no link: ${resetLink}`;
        const html = `<p>Para redefinir sua senha, clique no link: <a href="${resetLink}">${resetLink}</a></p>`;
        const isEmailDisabled = this.configService.get('EMAIL_DISABLED') === 'true';
        if (isEmailDisabled) {
            await this.simulateEmail(to, from, subject, text, html, resetLink);
        }
        else {
            await this.sendRealEmail(to, from, subject, text, html);
        }
    }
    async simulateEmail(to, from, subject, text, html, resetLink) {
        const simulationFile = this.configService.get('EMAIL_SIMULATION_FILE') ||
            'simulated_emails.log';
        const timestamp = new Date().toISOString();
        const simulatedContent = `
========================================
[SIMULAÇÃO DE ENVIO DE E-MAIL]
Data/Hora: ${timestamp}
Remetente: ${from}
Destinatário: ${to}
Assunto: ${subject}
----------------------------------------
Texto:
${text}
----------------------------------------
HTML:
${html}
========================================
`;
        this.logger.log(`[SIMULAÇÃO] Escrevendo e-mail de recuperação para ${to} no arquivo ${simulationFile}`);
        await fs.promises.appendFile(simulationFile, simulatedContent, 'utf8');
        this.logger.log(`[SIMULAÇÃO] Link de recuperação: ${resetLink}`);
    }
    async sendRealEmail(to, from, subject, text, html) {
        if (!this.transporter) {
            this.logger.error('Erro: Transporter do nodemailer não foi inicializado.');
            return;
        }
        await this.transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
        this.logger.log(`E-mail de recuperação de senha enviado com sucesso para ${to}`);
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map