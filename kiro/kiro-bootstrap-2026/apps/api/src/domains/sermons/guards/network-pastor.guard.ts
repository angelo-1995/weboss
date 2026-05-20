import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../infrastructure/database/database.service';

@Injectable()
export class NetworkPastorGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: { id: string; roles: string[] };
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Allow SUPER_ADMIN and ADMIN to pass
    if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')) {
      return true;
    }

    // Check if user has a NetworkLeader record with role 'PASTOR'
    const leaderRecord = await this.db.networkLeader.findFirst({
      where: {
        userId: user.id,
        role: 'PASTOR',
      },
    });

    if (!leaderRecord) {
      throw new ForbiddenException('Only network pastors can perform this action');
    }

    return true;
  }
}
