import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscipleshipRepository } from './discipleship.repository';
import { AuditService } from '../audit/audit.service';
import type {
  CreateRelationshipDto,
  UpdateRelationshipDto,
  RelationshipsQueryDto,
  CreateMilestoneDto,
  CreateCheckInDto,
  CompleteCheckInDto,
} from './dto/discipleship.dto';
import type { PaginatedResponse } from '@community-os/types';

@Injectable()
export class DiscipleshipService {
  constructor(
    private readonly repo: DiscipleshipRepository,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  // ── Relationships ─────────────────────────────────────────

  async findMany(query: RelationshipsQueryDto): Promise<PaginatedResponse<unknown>> {
    const { data, total } = await this.repo.findMany(query);
    return {
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        hasNextPage: query.page * query.pageSize < total,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async findById(id: string) {
    const rel = await this.repo.findById(id);
    if (!rel) throw new NotFoundException('Discipleship relationship not found');
    return rel;
  }

  async create(dto: CreateRelationshipDto, mentorId: string) {
    // Mentor cannot disciple themselves
    if (dto.discipleId === mentorId) {
      throw new BadRequestException('A person cannot disciple themselves');
    }

    // Check for existing active relationship of same type
    const existing = await this.repo.findExisting(mentorId, dto.discipleId, dto.type);
    if (existing) {
      throw new ConflictException('An active relationship of this type already exists');
    }

    // CYCLE DETECTION: Verify the disciple is not a mentor (direct or transitive) of the mentor
    const hasCycle = await this.detectCycle(dto.discipleId, mentorId);
    if (hasCycle) {
      throw new ConflictException(
        'Cannot create this relationship: it would create a cycle in the discipleship hierarchy. ' +
        'The proposed disciple is already a mentor (directly or transitively) of the proposed mentor.',
      );
    }

    const rel = await this.repo.create({
      mentor: { connect: { id: mentorId } },
      disciple: { connect: { id: dto.discipleId } },
      type: dto.type,
      notes: dto.notes,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      createdBy: { connect: { id: mentorId } },
      ...(dto.groupId && { group: { connect: { id: dto.groupId } } }),
    });

    this.events.emit('discipleship.relationship.created', {
      relationshipId: rel.id,
      mentorId,
      discipleId: dto.discipleId,
    });

    await this.audit.log({
      userId: mentorId,
      action: 'discipleship.created',
      resource: 'discipleship_relationships',
      resourceId: rel.id,
      newValues: { discipleId: dto.discipleId, type: dto.type },
    });

    return rel;
  }

  /**
   * Detect cycles using BFS: starting from `potentialAncestor`, traverse up
   * the mentor chain. If we reach `targetDescendant`, there's a cycle.
   */
  private async detectCycle(potentialAncestor: string, targetDescendant: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue: string[] = [potentialAncestor];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === targetDescendant) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      // Safety: limit depth to prevent infinite loops in corrupted data
      if (visited.size > 100) break;

      // Find all active relationships where `current` is the mentor
      const mentorRelationships = await this.repo.findActiveMentorships(current);
      for (const rel of mentorRelationships) {
        if (!visited.has(rel.discipleId)) {
          queue.push(rel.discipleId);
        }
      }
    }

    return false;
  }

  async update(id: string, dto: UpdateRelationshipDto, actorId: string) {
    const rel = await this.findById(id);

    // Only mentor or admin can update
    if (rel.mentorId !== actorId) {
      throw new ForbiddenException('Only the mentor can update this relationship');
    }

    // Handle finalization: set endDate and status COMPLETED
    const updateData: Record<string, unknown> = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.endDate !== undefined) {
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }

    // If status is COMPLETED, ensure endDate is set
    if (dto.status === 'COMPLETED' && !updateData.endDate) {
      updateData.endDate = new Date();
    }

    const updated = await this.repo.update(id, updateData);

    await this.audit.log({
      userId: actorId,
      action: dto.status === 'COMPLETED' ? 'discipleship.completed' : 'discipleship.updated',
      resource: 'discipleship_relationships',
      resourceId: id,
      newValues: { status: dto.status, endDate: updateData.endDate },
    });

    return updated;
  }

  async getStats(userId: string) {
    return this.repo.getStats(userId);
  }

  async getDiscipleTree(mentorId: string) {
    return this.repo.getDiscipleTree(mentorId);
  }

  /**
   * Get the full hierarchy tree for a user (ancestors + descendants).
   * Uses recursive CTE for efficiency.
   */
  async getFullHierarchy(userId: string) {
    return this.repo.getFullHierarchy(userId);
  }

  // ── Milestones ────────────────────────────────────────────

  async addMilestone(relationshipId: string, dto: CreateMilestoneDto, actorId: string) {
    await this.findById(relationshipId);
    return this.repo.addMilestone(relationshipId, {
      title: dto.title,
      description: dto.description,
      order: dto.order,
    });
  }

  async completeMilestone(milestoneId: string, actorId: string) {
    return this.repo.completeMilestone(milestoneId, new Date());
  }

  async deleteMilestone(milestoneId: string, actorId: string) {
    return this.repo.deleteMilestone(milestoneId);
  }

  // ── Check-ins ─────────────────────────────────────────────

  async addCheckIn(relationshipId: string, dto: CreateCheckInDto, actorId: string) {
    await this.findById(relationshipId);
    return this.repo.addCheckIn(relationshipId, {
      notes: dto.notes,
      rating: dto.rating,
      scheduledAt: new Date(dto.scheduledAt),
      attendedBy: dto.attendedBy,
    });
  }

  async completeCheckIn(checkInId: string, dto: CompleteCheckInDto, actorId: string) {
    return this.repo.completeCheckIn(checkInId, {
      notes: dto.notes,
      rating: dto.rating,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : new Date(),
    });
  }
}
