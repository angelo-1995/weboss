import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonsRepository } from './persons.repository';
import { CreatePersonDto, UpdatePersonDto, AdvancePipelineDto, TransferPersonDto, PersonsQueryDto } from './dto/persons.dto';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class PersonsService {
  constructor(
    private readonly repository: PersonsRepository,
    private readonly db: DatabaseService,
  ) {}

  async create(dto: CreatePersonDto, campusId: string, actorId: string) {
    const person = await this.repository.create({ ...dto, campusId });

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

  async findAll(query: PersonsQueryDto, campusId: string) {
    return this.repository.findAll(query, campusId);
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
