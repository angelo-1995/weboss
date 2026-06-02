import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { z } from 'zod';

const createStageSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  orderIndex: z.number().int().min(0),
  color: z.string().max(7).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

const updateStageSchema = createStageSchema.partial();

@Controller('pipeline-stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PipelineStagesController {
  constructor(private readonly db: DatabaseService) {}

  /**
   * GET /pipeline-stages
   * Returns all configurable pipeline stages for the user's campus/church.
   * Available to all authenticated users (for rendering badges, selectors, etc.)
   */
  @Get()
  @Roles('MEMBER', 'LEADER', 'ADMIN', 'SUPER_ADMIN')
  async findAll(@CurrentUser() user: CurrentUserData) {
    return this.db.pipelineStageConfig.findMany({
      where: { campusId: user.campusId, isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * GET /pipeline-stages/all (includes inactive - admin only)
   */
  @Get('all')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async findAllIncludingInactive(@CurrentUser() user: CurrentUserData) {
    return this.db.pipelineStageConfig.findMany({
      where: { campusId: user.campusId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * POST /pipeline-stages (admin only)
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() body: unknown, @CurrentUser() user: CurrentUserData) {
    const dto = createStageSchema.parse(body);
    return this.db.pipelineStageConfig.create({
      data: {
        name: dto.name,
        code: dto.code,
        orderIndex: dto.orderIndex,
        color: dto.color ?? null,
        description: dto.description ?? null,
        campus: { connect: { id: user.campusId } },
      },
    });
  }

  /**
   * PUT /pipeline-stages/:id (admin only)
   */
  @Put(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto = updateStageSchema.parse(body);
    return this.db.pipelineStageConfig.update({
      where: { id },
      data: dto,
    });
  }
}
