import { Injectable } from '@nestjs/common';
import { Prisma } from '@community-os/database';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { UsersQueryDto } from './dto/users.dto';

// Fields safe to return — never include password
const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  displayName: true,
  avatarUrl: true,
  phoneNumber: true,
  status: true,
  roles: true,
  campusId: true,
  networkId: true,
  spiritualStage: true,
  leaderCode: true,
  ministerialRole: true,
  isBaptized: true,
  hasFirstRetreat: true,
  hasAcademy: true,
  hasLaunch: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  network: { select: { id: true, name: true, code: true } },
} satisfies Prisma.UserSelect;

const USER_WITH_PROFILE_SELECT = {
  ...USER_SELECT,
  leaderId: true,
  networkId: true,
  ministerialRole: true,
  profile: true,
  campus: { select: { id: true, name: true, slug: true } },
  network: { select: { id: true, name: true, code: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMany(query: UsersQueryDto, visibleUserIds?: string[]) {
    const { page, pageSize, search, status, campusId, role, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(campusId && { campusId }),
      ...(role && { roles: { has: role } }),
      ...(visibleUserIds && { id: { in: visibleUserIds } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.user.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.db.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_WITH_PROFILE_SELECT,
    });
  }

  async findByEmail(email: string) {
    return this.db.user.findFirst({
      where: { email, deletedAt: null },
      select: USER_SELECT,
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      select: USER_WITH_PROFILE_SELECT,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
      select: USER_WITH_PROFILE_SELECT,
    });
  }

  async softDelete(id: string) {
    return this.db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true },
    });
  }

  async updateProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return this.db.userProfile.upsert({
      where: { userId },
      create: { userId, ...(data as object) },
      update: data,
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.db.user.count({ where: { id, deletedAt: null } });
    return count > 0;
  }

  async bulkUpdateNetwork(userIds: string[], networkId: string) {
    const result = await this.db.user.updateMany({
      where: { id: { in: userIds }, deletedAt: null },
      data: { networkId },
    });
    return result.count;
  }

  async findLeaderInfo(leaderId: string) {
    return this.db.user.findFirst({
      where: { id: leaderId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, leaderCode: true },
    });
  }

  async findUserGroups(userId: string) {
    return this.db.groupMember.findMany({
      where: { userId, leftAt: null },
      select: {
        role: true,
        group: { select: { id: true, name: true, code: true, type: true } },
      },
    });
  }

  async countSubordinates(userId: string): Promise<number> {
    return this.db.user.count({
      where: { leaderId: userId, deletedAt: null },
    });
  }
}
