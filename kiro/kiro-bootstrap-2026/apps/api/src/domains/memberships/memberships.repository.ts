import { Injectable } from '@nestjs/common';
import { Prisma } from '@community-os/database';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { MembershipsQueryDto } from './dto/memberships.dto';

const MEMBERSHIP_SELECT = {
  id: true,
  userId: true,
  groupId: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
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
  group: {
    select: { id: true, name: true, slug: true, type: true },
  },
} satisfies Prisma.MembershipSelect;

@Injectable()
export class MembershipsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMany(query: MembershipsQueryDto) {
    const { page, pageSize, userId, groupId, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.MembershipWhereInput = {
      ...(userId && { userId }),
      ...(groupId && { groupId }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.db.membership.findMany({
        where,
        select: MEMBERSHIP_SELECT,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.membership.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.db.membership.findUnique({ where: { id }, select: MEMBERSHIP_SELECT });
  }

  async findActiveByUser(userId: string) {
    return this.db.membership.findMany({
      where: { userId, status: 'ACTIVE' },
      select: MEMBERSHIP_SELECT,
      orderBy: { startDate: 'desc' },
    });
  }

  async create(data: Prisma.MembershipCreateInput) {
    return this.db.membership.create({ data, select: MEMBERSHIP_SELECT });
  }

  async update(id: string, data: Prisma.MembershipUpdateInput) {
    return this.db.membership.update({ where: { id }, data, select: MEMBERSHIP_SELECT });
  }

  // Stats for reporting
  async countByStatus(groupId?: string) {
    const where: Prisma.MembershipWhereInput = groupId ? { groupId } : {};
    return this.db.membership.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });
  }

  async getGrowthByMonth(months = 12) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return this.db.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "start_date"), 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM memberships
      WHERE "start_date" >= ${since}
        AND status = 'ACTIVE'
      GROUP BY DATE_TRUNC('month', "start_date")
      ORDER BY DATE_TRUNC('month', "start_date") ASC
    `;
  }
}
