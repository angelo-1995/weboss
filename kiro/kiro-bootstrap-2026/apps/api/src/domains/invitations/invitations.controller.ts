import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(
    @Body() body: { email: string; groupId?: string },
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invitationsService.create(body.email, user.id, body.groupId);
  }

  @Public()
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Body() body: { token: string; password: string; firstName?: string; lastName?: string },
  ) {
    return this.invitationsService.activate(
      body.token,
      body.password,
      body.firstName,
      body.lastName,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  async resend(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.invitationsService.resend(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    return this.invitationsService.findAll(user.id);
  }

  @Public()
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    const invitation = await this.invitationsService.findByToken(token);
    if (!invitation) {
      return { valid: false, message: 'Invitación inválida o expirada' };
    }
    return { valid: true, email: invitation.email };
  }
}
