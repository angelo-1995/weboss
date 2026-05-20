import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MembershipsRepository } from './memberships.repository';
import { AuditService } from '../audit/audit.service';
import type { CreateMembershipDto, UpdateMembershipDto, MembershipsQueryDto } from './dto/memberships.dto';
import type { PaginatedResponse } from '@community-os/types';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly repo: MembershipsRepository,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async findMany(query: MembershipsQueryDto): Promise<PaginatedResponse<unknown>> {
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
    const m = await this.repo.findById(id);
    if (!m) throw new NotFoundException('Membership not found');
    return m;
  }

  async findActiveByUser(userId: string) {
    return this.repo.findActiveByUser(userId);
  }

  async create(dto: CreateMembershipDto, actorId: string) {
    // Check for existing active membership in same group
    if (dto.groupId) {
      const existing = await this.repo.findMany({
        page: 1,
        pageSize: 1,
        userId: dto.userId,
        groupId: dto.groupId,
        status: 'ACTIVE',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (existing.data.length > 0) {
        throw new ConflictException('User already has an active membership in this group');
      }
    }

    const membership = await this.repo.create({
      user: { connect: { id: dto.userId } },
      status: dto.status,
      startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      notes: dto.notes,
      ...(dto.groupId && { group: { connect: { id: dto.groupId } } }),
    });

    this.events.emit('membership.created', {
      membershipId: membership.id,
      userId: dto.userId,
      groupId: dto.groupId,
    });

    await this.audit.log({
      userId: actorId,
      action: 'membership.created',
      resource: 'memberships',
      resourceId: membership.id,
      newValues: { userId: dto.userId, groupId: dto.groupId, status: dto.status },
    });

    return membership;
  }

  async update(id: string, dto: UpdateMembershipDto, actorId: string) {
    await this.findById(id);

    const updated = await this.repo.update(id, {
      ...(dto.status && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.endDate !== undefined && {
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      }),
    });

    await this.audit.log({
      userId: actorId,
      action: 'membership.updated',
      resource: 'memberships',
      resourceId: id,
      newValues: { status: dto.status },
    });

    return updated;
  }

  async getStats(groupId?: string) {
    const byStatus = await this.repo.countByStatus(groupId);
    const growth = await this.repo.getGrowthByMonth(12);

    const statusMap = Object.fromEntries(
      byStatus.map((s) => [s.status, s._count.status]),
    );

    return {
      total: Object.values(statusMap).reduce((a, b) => a + b, 0),
      active: statusMap['ACTIVE'] ?? 0,
      inactive: statusMap['INACTIVE'] ?? 0,
      suspended: statusMap['SUSPENDED'] ?? 0,
      pending: statusMap['PENDING'] ?? 0,
      growth: growth.map((g) => ({ month: g.month, count: Number(g.count) })),
    };
  }
}
