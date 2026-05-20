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
import { DiscipleshipService } from './discipleship.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  CreateRelationshipSchema,
  UpdateRelationshipSchema,
  RelationshipsQuerySchema,
  CreateMilestoneSchema,
  CreateCheckInSchema,
  CompleteCheckInSchema,
  type CreateRelationshipDto,
  type UpdateRelationshipDto,
  type CreateMilestoneDto,
  type CreateCheckInDto,
  type CompleteCheckInDto,
} from './dto/discipleship.dto';

@Controller('discipleship')
@UseGuards(JwtAuthGuard)
export class DiscipleshipController {
  constructor(private readonly service: DiscipleshipService) {}

  // ── Relationships ─────────────────────────────────────────

  @Get()
  findMany(@Query() query: Record<string, string>) {
    const parsed = RelationshipsQuerySchema.parse(query);
    return this.service.findMany(parsed);
  }

  @Get('stats/:userId')
  getStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.service.getStats(userId);
  }

  @Get('tree/:mentorId')
  getDiscipleTree(@Param('mentorId', ParseUUIDPipe) mentorId: string) {
    return this.service.getDiscipleTree(mentorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() body: CreateRelationshipDto, @CurrentUser() actor: CurrentUserData) {
    const dto = CreateRelationshipSchema.parse(body);
    return this.service.create(dto, actor.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRelationshipDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = UpdateRelationshipSchema.parse(body);
    return this.service.update(id, dto, actor.id);
  }

  // ── Milestones ────────────────────────────────────────────

  @Post(':id/milestones')
  addMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateMilestoneDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = CreateMilestoneSchema.parse(body);
    return this.service.addMilestone(id, dto, actor.id);
  }

  @Patch('milestones/:milestoneId/complete')
  @HttpCode(HttpStatus.OK)
  completeMilestone(
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.service.completeMilestone(milestoneId, actor.id);
  }

  @Delete('milestones/:milestoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMilestone(
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @CurrentUser() actor: CurrentUserData,
  ) {
    return this.service.deleteMilestone(milestoneId, actor.id);
  }

  // ── Check-ins ─────────────────────────────────────────────

  @Post(':id/check-ins')
  addCheckIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateCheckInDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = CreateCheckInSchema.parse(body);
    return this.service.addCheckIn(id, dto, actor.id);
  }

  @Patch('check-ins/:checkInId/complete')
  @HttpCode(HttpStatus.OK)
  completeCheckIn(
    @Param('checkInId', ParseUUIDPipe) checkInId: string,
    @Body() body: CompleteCheckInDto,
    @CurrentUser() actor: CurrentUserData,
  ) {
    const dto = CompleteCheckInSchema.parse(body);
    return this.service.completeCheckIn(checkInId, dto, actor.id);
  }
}
