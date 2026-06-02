import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonsRepository } from './persons.repository';
import { CreatePersonDto, UpdatePersonDto, AdvancePipelineDto, TransferPersonDto, PersonsQueryDto } from './dto/persons.dto';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { OwnershipService } from '../../common/services/ownership.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Injectable()
export class PersonsService {
  constructor(
    private readonly repository: PersonsRepository,
    private readonly db: DatabaseService,
    private readonly ownershipService: OwnershipService,
  ) {}

  /**
   * ADR-011: Determine ownerLeaderId based on role and group assignment.
   *
   * Rules:
   * - LEADER: ownerLeaderId = authenticated user (the leader who creates owns)
   * - COBERTURA role (user with ministerialRole COBERTURA): ownerLeaderId = leader of assigned group
   * - ADMIN/SUPER_ADMIN: ownerLeaderId = leader of assigned group if group specified, else null
   * - No group specified: ownerLeaderId = null
   */
  private async resolveOwnerLeaderId(
    actorId: string,
    roles: string[],
    currentGroupId?: string | null,
  ): Promise<string | null> {
    const isAdmin = roles.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
    const isLeader = roles.includes('LEADER');

    // If actor is a LEADER (non-admin), they own the person they create
    if (isLeader && !isAdmin) {
      return actorId;
    }

    // For ADMIN/SUPER_ADMIN or COBERTURA: assign to group leader if group specified
    if (currentGroupId) {
      const groupLeader = await this.db.groupMember.findFirst({
        where: { groupId: currentGroupId, role: 'LEADER', leftAt: null },
        select: { userId: true },
      });
      return groupLeader?.userId ?? null;
    }

    // No group → no owner yet
    return null;
  }

  async create(dto: CreatePersonDto, actor: CurrentUserData) {
    const campusId = actor.campusId;
    const actorId = actor.id;

    // ADR-011: Determine ownership
    const ownerLeaderId = await this.resolveOwnerLeaderId(
      actorId,
      actor.roles,
      dto.currentGroupId,
    );

    const person = await this.repository.create({ ...dto, campusId, ownerLeaderId });

    // If a pipeline stage was assigned, create initial history entry
    if (person.pipelineStageId) {
      await this.repository.createPipelineHistory({
        personId: person.id,
        fromStageId: null,
        toStageId: person.pipelineStageId,
        changedBy: actorId,
        notes: 'Registro inicial',
        campusId,
      });
    }

    // If assigned to a group, create team history entry
    if (person.currentGroupId) {
      await this.repository.createTeamHistory({
        personId: person.id,
        groupId: person.currentGroupId,
        assignedBy: actorId,
      });
    }

    return person;
  }

  async findById(id: string) {
    const person = await this.repository.findById(id);
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async findAll(query: PersonsQueryDto, campusId: string, visibleGroupIds?: string[] | null) {
    return this.repository.findAll(query, campusId, visibleGroupIds);
  }

  async update(id: string, dto: UpdatePersonDto) {
    await this.findById(id); // verify exists
    return this.repository.update(id, dto);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.repository.softDelete(id);
  }

  async advancePipeline(dto: AdvancePipelineDto, actorId: string) {
    const person = await this.findById(dto.personId);

    // Validate the target stage exists
    const targetStage = await this.db.pipelineStageConfig.findUnique({
      where: { id: dto.toStageId },
    });
    if (!targetStage) {
      throw new BadRequestException('Target pipeline stage does not exist');
    }

    // Validate not the same stage
    if (person.pipelineStageId === dto.toStageId) {
      throw new BadRequestException('Person is already in this stage');
    }

    // Update person's current stage
    await this.repository.advancePipeline(dto.personId, dto.toStageId);

    // Create history record
    await this.repository.createPipelineHistory({
      personId: dto.personId,
      fromStageId: person.pipelineStageId,
      toStageId: dto.toStageId,
      changedBy: actorId,
      notes: dto.notes,
      campusId: person.campusId,
    });

    return this.findById(dto.personId);
  }

  async transfer(dto: TransferPersonDto, actorId: string) {
    const person = await this.findById(dto.personId);

    // Validate target group exists
    const targetGroup = await this.db.group.findUnique({
      where: { id: dto.targetGroupId },
    });
    if (!targetGroup) {
      throw new BadRequestException('Target group does not exist');
    }

    // Close current team history
    if (person.currentGroupId) {
      await this.repository.closeTeamHistory(dto.personId, person.currentGroupId);
    }

    // Update person's current group
    await this.repository.transferToGroup(dto.personId, dto.targetGroupId);

    // ADR-011: Transfer ownership to new group's leader
    await this.ownershipService.transferOwnership(
      dto.personId,
      dto.targetGroupId,
      actorId,
      dto.reason ?? undefined,
    );

    // Create new team history entry
    await this.repository.createTeamHistory({
      personId: dto.personId,
      groupId: dto.targetGroupId,
      assignedBy: actorId,
      reason: dto.reason,
    });

    return this.findById(dto.personId);
  }

  async getPipelineTimeline(personId: string) {
    await this.findById(personId); // verify exists
    return this.repository.getPipelineHistory(personId);
  }
}
