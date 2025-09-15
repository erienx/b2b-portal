import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user, route } = request;

    if (!user) return false;

    if (!user.must_change_password) return true;

    const allowedRoutes = ['/auth/change-password', '/auth/logout'];
    if (allowedRoutes.includes(route.path)) {
      return true;
    }

    throw new ForbiddenException('Password change required before accessing the system');
  }
}
