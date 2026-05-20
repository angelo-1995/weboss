import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  AddMemberSchema,
  UpdateMemberRoleSchema,
  GroupMembersQuerySchema,
  type AddMemberDto,
  type UpdateMemberRoleDto,
} from './dto/groups.dto';

@Controller('groups/:groupId/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Query() query: Record<string, string>,
  ) {
    const parsed = GroupMembersQuerySchema.parse(query);
    return this.membersService.findMembers(groupId, parsed);
  }

  @Get('leaders')
  getLeaders(@Param('groupId', ParseUUIDPipe) groupId: string) {
    return this.membersService.getLeaders(groupId);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  addMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() body: AddMemberDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = AddMemberSchema.parse(body);
    return this.membersService.addMember(groupId, dto, actor.id);
  }

  @Patch(':userId/role')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  updateRole(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: UpdateMemberRoleDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = UpdateMemberRoleSchema.parse(body);
    return this.membersService.updateMemberRole(groupId, userId, dto, actor.id);
  }

  @Delete(':userId')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.membersService.removeMember(groupId, userId, actor.id);
  }
}
