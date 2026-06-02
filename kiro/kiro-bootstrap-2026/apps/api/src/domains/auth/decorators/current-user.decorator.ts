import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  roles: string[];
  status: string;
  sessionId: string;
  campusId: string;
  leaderCode: string | null;
  networkId: string | null;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUserData }>();
    return request.user;
  },
);
