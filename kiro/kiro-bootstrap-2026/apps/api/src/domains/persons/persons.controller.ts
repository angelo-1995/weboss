import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PersonsService } from './persons.service';
import {
  createPersonSchema,
  updatePersonSchema,
  advancePipelineSchema,
  transferPersonSchema,
  personsQuerySchema,
  CreatePersonDto,
  UpdatePersonDto,
  AdvancePipelineDto,
  TransferPersonDto,
  PersonsQueryDto,
} from './dto/persons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { HierarchyVisibilityService } from '../../common/services/hierarchy-visibility.service';

@Controller('persons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonsController {
  constructor(
    private readonly service: PersonsService,
    private readonly hierarchy: HierarchyVisibilityService,
  ) {}

  @Post()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async create(@Body() body: unknown, @CurrentUser() user: CurrentUserData) {
    const dto: CreatePersonDto = createPersonSchema.parse(body);
    return this.service.create(dto, user);
  }

  @Get()
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async findAll(@Query() query: unknown, @CurrentUser() user: CurrentUserData) {
    const dto: PersonsQueryDto = personsQuerySchema.parse(query);
    const visibleGroupIds = await this.hierarchy.getVisibleGroupIds(user.id, user.roles);
    return this.service.findAll(dto, user.campusId, visibleGroupIds);
  }

  @Get(':id')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto: UpdatePersonDto = updatePersonSchema.parse(body);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async delete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Post('advance-pipeline')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async advancePipeline(@Body() body: unknown, @CurrentUser() user: CurrentUserData) {
    const dto: AdvancePipelineDto = advancePipelineSchema.parse(body);
    return this.service.advancePipeline(dto, user.id);
  }

  @Post('transfer')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async transfer(@Body() body: unknown, @CurrentUser() user: CurrentUserData) {
    const dto: TransferPersonDto = transferPersonSchema.parse(body);
    return this.service.transfer(dto, user.id);
  }

  @Get(':id/timeline')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  async getTimeline(@Param('id') id: string) {
    return this.service.getPipelineTimeline(id);
  }
}
