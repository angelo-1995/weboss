import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { z } from 'zod';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

const GrantSchema = z.object({
  userId: z.string().uuid(),
  resource: z.string().min(1),
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE']),
  resourceId: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  granted: z.boolean().default(true),
});

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get('users/:userId')
  getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.service.getUserPermissions(userId);
  }

  @Get('users/:userId/effective')
  getEffective(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.service.getEffectivePermissions(userId, actor.roles as never);
  }

  @Post('grant')
  grant(@Body() body: unknown, @CurrentUser() actor: CurrentUserData) {
    const dto = GrantSchema.parse(body);
    if (dto.granted) {
      return this.service.grantPermission({
        userId: dto.userId,
        resource: dto.resource,
        action: dto.action,
        resourceId: dto.resourceId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        actorId: actor.id,
      });
    }
    return this.service.denyPermission({
      userId: dto.userId,
      resource: dto.resource,
      action: dto.action,
      resourceId: dto.resourceId,
    });
  }

  @Delete(':id/users/:userId')
  revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.service.revokePermission(id, userId);
  }
}
