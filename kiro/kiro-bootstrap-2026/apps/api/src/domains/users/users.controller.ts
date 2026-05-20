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
import { UsersService } from './users.service';
import { OrganigramaService } from './organigrama.service';
import { CoberturaService } from './cobertura.service';
import { HierarchyVisibilityService } from '../../common/services/hierarchy-visibility.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UpdateProfileSchema,
  UsersQuerySchema,
  type CreateUserDto,
  type UpdateUserDto,
  type UpdateProfileDto,
} from './dto/users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly organigramaService: OrganigramaService,
    private readonly coberturaService: CoberturaService,
    private readonly visibilityService: HierarchyVisibilityService,
  ) {}

  @Get('organigrama')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getOrganigrama(): Promise<any> {
    return this.organigramaService.getOrganigrama();
  }

  @Get('cobertura')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getCobertura(): Promise<any> {
    return this.coberturaService.getCoberturaTree();
  }

  @Get()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async findMany(@Query() query: Record<string, string>, @CurrentUser() user: CurrentUserData) {
    const parsed = UsersQuerySchema.parse(query);
    const isAdmin = user.roles.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

    if (isAdmin) {
      return this.usersService.findMany(parsed);
    }

    // For LEADER: filter by hierarchy visibility
    const visibleIds = await this.visibilityService.getVisibleUserIds(user.id, user.roles);
    return this.usersService.findMany(parsed, visibleIds ?? undefined);
  }

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() body: CreateUserDto, @CurrentUser() actor: CurrentUserData) {
    const dto = CreateUserSchema.parse(body);
    return this.usersService.create(dto, actor.id);
  }

  @Patch('me/profile')
  updateMyProfile(
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const dto = UpdateProfileSchema.parse(body);
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = UpdateUserSchema.parse(body);
    return this.usersService.update(id, dto, actor.id);
  }

  @Patch(':id/profile')
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProfileDto,
  ) {
    const dto = UpdateProfileSchema.parse(body);
    return this.usersService.updateProfile(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.usersService.remove(id, actor.id);
  }

  @Patch('bulk-network')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async bulkNetworkAssign(
    @Body() body: { userIds: string[]; networkId: string },
  ) {
    const { userIds, networkId } = body;
    const result = await this.usersService.bulkAssignNetwork(userIds, networkId);
    return result;
  }
}
