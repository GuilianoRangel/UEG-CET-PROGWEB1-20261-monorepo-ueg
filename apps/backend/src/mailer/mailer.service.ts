import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test@gmail.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:4200/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: '"Monorepo UEG" <noreply@ueg.br>',
      to,
      subject: 'Recuperação de Senha',
      text: `Para redefinir sua senha, clique no link: ${resetLink}`,
      html: `<p>Para redefinir sua senha, clique no link: <a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
