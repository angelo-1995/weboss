import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

const CACHE_TTL = 900; // 15 min

@Injectable()
export class ReportingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  // ── Overview KPIs ─────────────────────────────────────────

  async getOverview(campusId?: string, visibleGroupIds?: string[] | null) {
    const scopeKey = visibleGroupIds ? visibleGroupIds.sort().join(',').slice(0, 32) : 'all';
    const cacheKey = `report:overview:${campusId ?? 'all'}:${scopeKey}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const userWhere = {
        deletedAt: null,
        ...(campusId && { campusId }),
      };

      const groupWhere: any = {
        deletedAt: null,
        ...(campusId && { campusId }),
      };

      // ADR-010: Scope groups by visible IDs when non-null
      if (visibleGroupIds) {
        groupWhere.id = { in: visibleGroupIds };
      }

      const [
        totalUsers,
        activeUsers,
        totalGroups,
        activeGroups,
        totalMemberships,
        activeMemberships,
        totalDiscipleships,
      ] = await Promise.all([
        this.db.user.count({ where: userWhere }),
        this.db.user.count({ where: { ...userWhere, status: 'ACTIVE' } }),
        this.db.group.count({ where: groupWhere }),
        this.db.group.count({ where: { ...groupWhere, isActive: true } }),
        this.db.membership.count({ where: visibleGroupIds ? { groupId: { in: visibleGroupIds } } : (campusId ? { group: { campusId } } : {}) }),
        this.db.membership.count({
          where: { status: 'ACTIVE', ...(visibleGroupIds ? { groupId: { in: visibleGroupIds } } : (campusId ? { group: { campusId } } : {})) },
        }),
        this.db.discipleshipRelationship.count({ where: { status: 'ACTIVE' } }),
      ]);

      return {
        users: { total: totalUsers, active: activeUsers },
        groups: { total: totalGroups, active: activeGroups },
        memberships: { total: totalMemberships, active: activeMemberships },
        discipleships: { active: totalDiscipleships },
        generatedAt: new Date().toISOString(),
      };
    }, CACHE_TTL);
  }

  // ── Group Report ──────────────────────────────────────────

  async getGroupReport(groupId: string, filters?: {
    startDate?: string;
    endDate?: string;
    campusId?: string;
    ministryId?: string;
  }) {
    const filterKey = filters ? JSON.stringify(filters) : '';
    const cacheKey = `report:group:${groupId}:${filterKey}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const dateFilter = {
        ...(filters?.startDate && { gte: new Date(filters.startDate) }),
        ...(filters?.endDate && { lte: new Date(filters.endDate) }),
      };

      const [group, memberCount, membersByRole, activeMemberships, recentCheckIns] =
        await Promise.all([
          this.db.group.findUnique({
            where: { id: groupId },
            select: { id: true, name: true, type: true, isActive: true, createdAt: true, campusId: true, ministryId: true },
          }),
          this.db.groupMember.count({ where: { groupId, leftAt: null } }),
          this.db.groupMember.groupBy({
            by: ['role'],
            where: { groupId, leftAt: null },
            _count: { role: true },
          }),
          this.db.membership.count({ where: { groupId, status: 'ACTIVE' } }),
          this.db.discipleshipCheckIn.count({
            where: {
              relationship: { groupId },
              completedAt: { not: null },
              scheduledAt: Object.keys(dateFilter).length > 0
                ? dateFilter
                : { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          }),
        ]);

      // Growth: compare current members vs previous month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const previousMonthMembers = await this.db.groupMember.count({
        where: { groupId, joinedAt: { lte: oneMonthAgo }, leftAt: null },
      });
      const monthlyGrowth = memberCount - previousMonthMembers;

      return {
        group,
        members: {
          total: memberCount,
          byRole: Object.fromEntries(membersByRole.map((r) => [r.role, r._count.role])),
          monthlyGrowth,
        },
        memberships: { active: activeMemberships },
        checkInsLast30Days: recentCheckIns,
        averageAttendance: recentCheckIns > 0 ? Math.round(recentCheckIns / 4) : 0,
        generatedAt: new Date().toISOString(),
      };
    }, CACHE_TTL);
  }

  // ── Discipleship Report ───────────────────────────────────

  async getDiscipleshipReport(mentorId?: string) {
    const cacheKey = `report:discipleship:${mentorId ?? 'all'}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const where = mentorId ? { mentorId } : {};

      const [total, byStatus, byType, completedMilestones, pendingCheckIns] = await Promise.all([
        this.db.discipleshipRelationship.count({ where }),
        this.db.discipleshipRelationship.groupBy({
          by: ['status'],
          where,
          _count: { status: true },
        }),
        this.db.discipleshipRelationship.groupBy({
          by: ['type'],
          where,
          _count: { type: true },
        }),
        this.db.discipleshipMilestone.count({
          where: { completedAt: { not: null }, ...(mentorId && { relationship: { mentorId } }) },
        }),
        this.db.discipleshipCheckIn.count({
          where: {
            completedAt: null,
            scheduledAt: { lte: new Date() },
            ...(mentorId && { relationship: { mentorId } }),
          },
        }),
      ]);

      return {
        total,
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])),
        byType: Object.fromEntries(byType.map((t) => [t.type, t._count.type])),
        milestones: { completed: completedMilestones },
        checkIns: { pending: pendingCheckIns },
        generatedAt: new Date().toISOString(),
      };
    }, CACHE_TTL);
  }

  // ── Growth Metrics ────────────────────────────────────────

  async getGrowthMetrics(months = 12) {
    const cacheKey = `report:growth:${months}`;

    return this.cache.getOrSet(cacheKey, async () => {
      const since = new Date();
      since.setMonth(since.getMonth() - months);

      const [userGrowth, membershipGrowth, groupGrowth] = await Promise.all([
        this.db.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS count
          FROM users
          WHERE created_at >= ${since} AND deleted_at IS NULL
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at) ASC
        `,
        this.db.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT TO_CHAR(DATE_TRUNC('month', start_date), 'YYYY-MM') AS month, COUNT(*) AS count
          FROM memberships
          WHERE start_date >= ${since} AND status = 'ACTIVE'
          GROUP BY DATE_TRUNC('month', start_date)
          ORDER BY DATE_TRUNC('month', start_date) ASC
        `,
        this.db.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month, COUNT(*) AS count
          FROM groups
          WHERE created_at >= ${since} AND deleted_at IS NULL
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at) ASC
        `,
      ]);

      const toSeries = (rows: { month: string; count: bigint }[]) =>
        rows.map((r) => ({ month: r.month, count: Number(r.count) }));

      return {
        users: toSeries(userGrowth),
        memberships: toSeries(membershipGrowth),
        groups: toSeries(groupGrowth),
        generatedAt: new Date().toISOString(),
      };
    }, CACHE_TTL);
  }
}
