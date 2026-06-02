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
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import { HierarchyVisibilityService } from '../../common/services/hierarchy-visibility.service';
import {
  CreateGroupSchema,
  UpdateGroupSchema,
  GroupsQuerySchema,
  type CreateGroupDto,
  type UpdateGroupDto,
} from './dto/groups.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly hierarchy: HierarchyVisibilityService,
  ) {}

  @Get()
  async findMany(@Query() query: Record<string, string>, @CurrentUser() user: CurrentUserData) {
    const parsed = GroupsQuerySchema.parse(query);
    const visibleGroupIds = await this.hierarchy.getVisibleGroupIds(user.id, user.roles);
    return this.groupsService.findMany(parsed, visibleGroupIds);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.findById(id);
  }

  @Get(':id/hierarchy')
  getHierarchy(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupsService.getHierarchy(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  create(@Body() body: CreateGroupDto, @CurrentUser() actor: CurrentUserData) {
    const dto = CreateGroupSchema.parse(body);
    return this.groupsService.create(dto, actor.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'LEADER')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGroupDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = UpdateGroupSchema.parse(body);
    return this.groupsService.update(id, dto, actor.id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.groupsService.remove(id, actor.id);
  }
}
