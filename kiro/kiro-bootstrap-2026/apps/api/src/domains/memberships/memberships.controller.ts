import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  CreateMembershipSchema,
  UpdateMembershipSchema,
  MembershipsQuerySchema,
  type CreateMembershipDto,
  type UpdateMembershipDto,
} from './dto/memberships.dto';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
  constructor(private readonly service: MembershipsService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  findMany(@Query() query: Record<string, string>) {
    return this.service.findMany(MembershipsQuerySchema.parse(query));
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  getStats(@Query('groupId') groupId?: string) {
    return this.service.getStats(groupId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.service.findActiveByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  create(@Body() body: CreateMembershipDto, @CurrentUser() actor: CurrentUserData) {
    return this.service.create(CreateMembershipSchema.parse(body), actor.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMembershipDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.service.update(id, UpdateMembershipSchema.parse(body), actor.id);
  }
}
