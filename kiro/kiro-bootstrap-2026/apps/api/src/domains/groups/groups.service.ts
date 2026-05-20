import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GroupsRepository } from './groups.repository';
import { AuditService } from '../audit/audit.service';
import type { CreateGroupDto, UpdateGroupDto, GroupsQueryDto } from './dto/groups.dto';
import type { PaginatedResponse } from '@community-os/types';

@Injectable()
export class GroupsService {
  constructor(
    private readonly repo: GroupsRepository,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async findMany(query: GroupsQueryDto): Promise<PaginatedResponse<unknown>> {
    const { data, total } = await this.repo.findMany(query);

    // Map _count.members to memberCount and include leader info
    const enriched = await Promise.all(
      data.map(async (group: any) => {
        const leaders = await this.repo.getLeaders(group.id);
        const leader = leaders[0]?.user ?? null;
        return {
          ...group,
          memberCount: group._count?.members ?? 0,
          leaderName: leader ? `${leader.firstName} ${leader.lastName}` : null,
          _count: undefined,
        };
      }),
    );

    return {
      data: enriched,
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
    const group = await this.repo.findById(id);
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(dto: CreateGroupDto, actorId: string) {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) throw new ConflictException('Slug already in use');

    // Validate parent exists if provided
    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent) throw new BadRequestException('Parent group not found');
    }

    const group = await this.repo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      type: dto.type,
      createdBy: { connect: { id: actorId } },
      ...(dto.parentId && { parent: { connect: { id: dto.parentId } } }),
      ...(dto.campusId && { campus: { connect: { id: dto.campusId } } }),
      ...(dto.ministryId && { ministry: { connect: { id: dto.ministryId } } }),
    });

    // Auto-add creator as LEADER
    await this.repo.addMember(group.id, actorId, 'LEADER');

    this.events.emit('group.created', { groupId: group.id, actorId });

    await this.audit.log({
      userId: actorId,
      action: 'group.created',
      resource: 'groups',
      resourceId: group.id,
      newValues: { name: group.name, type: group.type },
    });

    return group;
  }

  async update(id: string, dto: UpdateGroupDto, actorId: string) {
    await this.findById(id);

    const updated = await this.repo.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.slug && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type && { type: dto.type }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.parentId !== undefined && {
        parent: dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true },
      }),
      ...(dto.campusId !== undefined && {
        campus: dto.campusId ? { connect: { id: dto.campusId } } : { disconnect: true },
      }),
      ...(dto.ministryId !== undefined && {
        ministry: dto.ministryId ? { connect: { id: dto.ministryId } } : { disconnect: true },
      }),
    });

    await this.audit.log({
      userId: actorId,
      action: 'group.updated',
      resource: 'groups',
      resourceId: id,
    });

    return updated;
  }

  async remove(id: string, actorId: string) {
    await this.findById(id);

    // Check no active children
    const children = await this.repo.getChildren(id);
    if (children.length > 0) {
      throw new BadRequestException('Cannot delete a group with active sub-groups');
    }

    await this.repo.softDelete(id);

    await this.audit.log({
      userId: actorId,
      action: 'group.deleted',
      resource: 'groups',
      resourceId: id,
    });
  }

  async getHierarchy(id: string) {
    const group = await this.findById(id);
    const [children, ancestors] = await Promise.all([
      this.repo.getChildren(id),
      this.repo.getAncestors(id),
    ]);
    return { group, ancestors, children };
  }
}
