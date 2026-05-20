import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any, info: any) {
    // Handle token expiration with specific code
    if (info && typeof info === 'object' && 'name' in info) {
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
          message: 'Access token expired',
        });
      }
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          statusCode: 401,
          code: 'TOKEN_INVALID',
          message: 'Invalid access token',
        });
      }
    }

    if (err || !user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
