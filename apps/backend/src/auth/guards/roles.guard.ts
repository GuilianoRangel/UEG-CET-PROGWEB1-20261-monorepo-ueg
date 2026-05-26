import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const logger = new Logger(RolesGuard.name);
    logger.debug(`canActivate. Role: ${requiredRoles}`);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    logger.debug(`user object from passport: ${JSON.stringify(user)}`);
    logger.debug(`user.role: ${user?.role}`);
    return requiredRoles.some((role) => user?.role === role);
  }
}
