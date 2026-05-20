import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GroupsRepository } from './groups.repository';
import { AuditService } from '../audit/audit.service';
import type { AddMemberDto, UpdateMemberRoleDto, GroupMembersQueryDto } from './dto/groups.dto';
import type { PaginatedResponse } from '@community-os/types';

@Injectable()
export class MembersService {
  constructor(
    private readonly repo: GroupsRepository,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
  ) {}

  async findMembers(groupId: string, query: GroupMembersQueryDto): Promise<PaginatedResponse<unknown>> {
    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const { data, total } = await this.repo.findMembers(groupId, query);
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

  async getLeaders(groupId: string) {
    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    return this.repo.getLeaders(groupId);
  }

  async addMember(groupId: string, dto: AddMemberDto, actorId: string) {
    const group = await this.repo.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const existing = await this.repo.findMember(groupId, dto.userId);
    if (existing) throw new ConflictException('User is already a member of this group');

    const member = await this.repo.addMember(groupId, dto.userId, dto.role);

    this.events.emit('group.member.added', {
      groupId,
      userId: dto.userId,
      role: dto.role,
    });

    await this.audit.log({
      userId: actorId,
      action: 'group.member.added',
      resource: 'group_members',
      resourceId: groupId,
      newValues: { userId: dto.userId, role: dto.role },
    });

    return member;
  }

  async updateMemberRole(groupId: string, userId: string, dto: UpdateMemberRoleDto, actorId: string) {
    const existing = await this.repo.findMember(groupId, userId);
    if (!existing) throw new NotFoundException('Member not found in this group');

    // Prevent removing the last leader
    if (existing.role === 'LEADER' && dto.role !== 'LEADER') {
      const leaders = await this.repo.getLeaders(groupId);
      if (leaders.length <= 1) {
        throw new BadRequestException('Group must have at least one leader');
      }
    }

    const updated = await this.repo.updateMemberRole(groupId, userId, dto.role);

    await this.audit.log({
      userId: actorId,
      action: 'group.member.role_changed',
      resource: 'group_members',
      resourceId: groupId,
      oldValues: { userId, role: existing.role },
      newValues: { userId, role: dto.role },
    });

    return updated;
  }

  async removeMember(groupId: string, userId: string, actorId: string) {
    const existing = await this.repo.findMember(groupId, userId);
    if (!existing) throw new NotFoundException('Member not found in this group');

    // Prevent removing the last leader
    if (existing.role === 'LEADER') {
      const leaders = await this.repo.getLeaders(groupId);
      if (leaders.length <= 1) {
        throw new BadRequestException('Cannot remove the last leader of a group');
      }
    }

    await this.repo.removeMember(groupId, userId);

    this.events.emit('group.member.removed', { groupId, userId });

    await this.audit.log({
      userId: actorId,
      action: 'group.member.removed',
      resource: 'group_members',
      resourceId: groupId,
      newValues: { userId },
    });
  }
}
