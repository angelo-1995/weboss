import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SpiritualStageService } from './spiritual-stage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpiritualStageController {
  constructor(private readonly stageService: SpiritualStageService) {}

  @Get('pipeline')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getStageStats() {
    return this.stageService.getStageStats();
  }

  @Get('pipeline/unassigned')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getUnassignedUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.stageService.getUnassignedUsers(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('pipeline/:stage')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getUsersByStage(
    @Param('stage') stage: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.stageService.getUsersByStage(
      stage.toUpperCase(),
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Post(':id/promote')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  promoteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { toStage: string; notes?: string },
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.stageService.promoteUser(id, body.toStage, actor.id, body.notes);
  }

  @Post(':id/assign-stage')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  assignStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { stage: string },
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.stageService.assignStage(id, body.stage, actor.id);
  }

  @Get(':id/milestones')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getMilestones(@Param('id', ParseUUIDPipe) id: string) {
    return this.stageService.getMilestones(id);
  }

  @Patch(':id/milestones')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  updateMilestones(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: {
      isBaptized?: boolean;
      baptizedDate?: string | null;
      hasFirstRetreat?: boolean;
      retreatDate?: string | null;
      hasAcademy?: boolean;
      academyDate?: string | null;
      hasLaunch?: boolean;
      launchDate?: string | null;
    },
  ) {
    return this.stageService.updateMilestones(id, body);
  }

  @Get(':id/transitions')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getTransitionHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.stageService.getTransitionHistory(id);
  }

  @Get(':id/leader-code')
  @Roles('LEADER', 'ADMIN', 'SUPER_ADMIN')
  getLeaderCode(@Param('id', ParseUUIDPipe) id: string) {
    return this.stageService.getLeaderCode(id);
  }
}
