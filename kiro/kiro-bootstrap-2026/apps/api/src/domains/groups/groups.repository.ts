import { Injectable } from '@nestjs/common';
import { Prisma } from '@community-os/database';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { GroupsQueryDto, GroupMembersQueryDto } from './dto/groups.dto';

const GROUP_SELECT = {
  id: true,
  name: true,
  slug: true,
  code: true,
  description: true,
  type: true,
  isActive: true,
  parentId: true,
  campusId: true,
  ministryId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { members: { where: { leftAt: null } } } },
} satisfies Prisma.GroupSelect;

const GROUP_DETAIL_SELECT = {
  ...GROUP_SELECT,
  parent: { select: { id: true, name: true, slug: true } },
  campus: { select: { id: true, name: true, slug: true } },
  ministry: { select: { id: true, name: true, slug: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.GroupSelect;

@Injectable()
export class GroupsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMany(query: GroupsQueryDto) {
    const { page, pageSize, search, type, campusId, ministryId, parentId, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GroupWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(campusId && { campusId }),
      ...(ministryId && { ministryId }),
      ...(parentId !== undefined && { parentId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.db.group.findMany({
        where,
        select: GROUP_SELECT,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.group.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.db.group.findFirst({
      where: { id, deletedAt: null },
      select: GROUP_DETAIL_SELECT,
    });
  }

  async findBySlug(slug: string) {
    return this.db.group.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
  }

  async create(data: Prisma.GroupCreateInput) {
    return this.db.group.create({ data, select: GROUP_DETAIL_SELECT });
  }

  async update(id: string, data: Prisma.GroupUpdateInput) {
    return this.db.group.update({ where: { id }, data, select: GROUP_DETAIL_SELECT });
  }

  async softDelete(id: string) {
    return this.db.group.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  // ── Members ──────────────────────────────────────────────

  async findMembers(groupId: string, query: GroupMembersQueryDto) {
    const { page, pageSize, role, search } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.GroupMemberWhereInput = {
      groupId,
      leftAt: null,
      ...(role && { role }),
      ...(search && {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.db.groupMember.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { joinedAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
              status: true,
            },
          },
        },
      }),
      this.db.groupMember.count({ where }),
    ]);

    return { data, total };
  }

  async findMember(groupId: string, userId: string) {
    return this.db.groupMember.findFirst({
      where: { groupId, userId, leftAt: null },
    });
  }

  async addMember(groupId: string, userId: string, role: string) {
    // Upsert: if previously left, re-activate
    return this.db.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, role: role as never },
      update: { role: role as never, leftAt: null, joinedAt: new Date() },
    });
  }

  async updateMemberRole(groupId: string, userId: string, role: string) {
    return this.db.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { role: role as never },
    });
  }

  async removeMember(groupId: string, userId: string) {
    return this.db.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { leftAt: new Date() },
    });
  }

  async getLeaders(groupId: string) {
    return this.db.groupMember.findMany({
      where: { groupId, role: { in: ['LEADER', 'CO_LEADER'] }, leftAt: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });
  }

  // Hierarchy helpers
  async getChildren(parentId: string) {
    return this.db.group.findMany({
      where: { parentId, deletedAt: null },
      select: GROUP_SELECT,
    });
  }

  async getAncestors(groupId: string): Promise<{ id: string; name: string; slug: string }[]> {
    // Walk up the tree iteratively (max depth guard = 10)
    const ancestors: { id: string; name: string; slug: string }[] = [];
    let currentId: string | null = groupId;
    let depth = 0;

    while (currentId && depth < 10) {
      const group = await this.db.group.findFirst({
        where: { id: currentId },
        select: { id: true, name: true, slug: true, parentId: true },
      });
      if (!group || !group.parentId) break;
      ancestors.unshift({ id: group.id, name: group.name, slug: group.slug });
      currentId = group.parentId;
      depth++;
    }

    return ancestors;
  }
}
