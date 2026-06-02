import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CreatePersonDto, PersonsQueryDto, UpdatePersonDto } from './dto/persons.dto';

@Injectable()
export class PersonsRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreatePersonDto & { campusId: string; ownerLeaderId?: string | null }) {
    return this.db.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender,
        address: data.address,
        avatarUrl: data.avatarUrl,
        pipelineStageId: data.pipelineStageId,
        currentGroupId: data.currentGroupId,
        ownerLeaderId: data.ownerLeaderId ?? null,
        notes: data.notes,
        campusId: data.campusId,
      },
      include: {
        pipelineStage: true,
        currentGroup: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findById(id: string) {
    return this.db.person.findUnique({
      where: { id, deletedAt: null },
      include: {
        pipelineStage: true,
        currentGroup: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async findAll(query: PersonsQueryDto, campusId: string, visibleGroupIds?: string[] | null) {
    const where: any = {
      campusId,
      deletedAt: null,
    };

    // ADR-010: Ministerial Scope filter
    if (visibleGroupIds) {
      where.currentGroupId = { in: visibleGroupIds };
    }

    if (query.pipelineStageId) {
      where.pipelineStageId = query.pipelineStageId;
    }
    if (query.currentGroupId) {
      // If scope is active, only allow filtering to a group within visible scope
      if (visibleGroupIds) {
        if (visibleGroupIds.includes(query.currentGroupId)) {
          where.currentGroupId = query.currentGroupId;
        }
        // If not in visible scope, keep the scope filter (ignore invalid group filter)
      } else {
        where.currentGroupId = query.currentGroupId;
      }
    }
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.person.findMany({
        where,
        include: {
          pipelineStage: true,
          currentGroup: { select: { id: true, name: true, code: true } },
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      this.db.person.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(id: string, data: UpdatePersonDto) {
    return this.db.person.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate ? new Date(data.birthDate) : null }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        pipelineStage: true,
        currentGroup: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async softDelete(id: string) {
    return this.db.person.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async advancePipeline(personId: string, toStageId: string) {
    return this.db.person.update({
      where: { id: personId },
      data: { pipelineStageId: toStageId },
    });
  }

  async createPipelineHistory(data: {
    personId: string;
    fromStageId: string | null;
    toStageId: string;
    changedBy: string;
    notes?: string | null;
    campusId: string;
  }) {
    return this.db.personPipelineHistory.create({ data });
  }

  async getPipelineHistory(personId: string) {
    return this.db.personPipelineHistory.findMany({
      where: { personId },
      include: {
        fromStage: { select: { id: true, name: true, code: true, color: true } },
        toStage: { select: { id: true, name: true, code: true, color: true } },
      },
      orderBy: { changedAt: 'desc' },
    });
  }

  async transferToGroup(personId: string, groupId: string) {
    return this.db.person.update({
      where: { id: personId },
      data: { currentGroupId: groupId },
    });
  }

  async createTeamHistory(data: {
    personId: string;
    groupId: string;
    assignedBy?: string | null;
    reason?: string | null;
  }) {
    return this.db.personTeamHistory.create({ data });
  }

  async closeTeamHistory(personId: string, groupId: string) {
    const active = await this.db.personTeamHistory.findFirst({
      where: { personId, groupId, removedAt: null },
      orderBy: { assignedAt: 'desc' },
    });
    if (active) {
      await this.db.personTeamHistory.update({
        where: { id: active.id },
        data: { removedAt: new Date() },
      });
    }
  }
}
