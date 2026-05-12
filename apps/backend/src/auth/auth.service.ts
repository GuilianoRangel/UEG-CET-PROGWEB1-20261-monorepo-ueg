import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BusinessException } from '../common/exceptions/business.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BusinessException('E-mail/senha não confere', 'AUTH_INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(pass, user.senha);
    if (!isMatch) {
      throw new BusinessException('E-mail/senha não confere', 'AUTH_INVALID_CREDENTIALS');
    }

    if (!user.ativo) {
      throw new BusinessException('Conta aguardando liberação do administrador', 'AUTH_USER_INACTIVE');
    }

    const { senha, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, nome: user.nome };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
