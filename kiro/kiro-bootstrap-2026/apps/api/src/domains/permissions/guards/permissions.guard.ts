import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions.service';
import { PERMISSION_KEY, type RequiredPermission } from '../decorators/require-permission.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';
import type { UserRole } from '@community-os/types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) return true;

    const req = context.switchToHttp().getRequest<{ user: CurrentUserData; params: Record<string, string> }>();
    const user = req.user;

    if (!user) throw new ForbiddenException();

    // Optional: pass resourceId from route params for fine-grained ABAC
    const resourceId = req.params['id'];

    const allowed = await this.permissionsService.can(
      user.id,
      user.roles as UserRole[],
      required.resource,
      required.action,
      resourceId,
    );

    if (!allowed) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}
