import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';

const CACHE_TTL = 600; // 10 min for analytics

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly cache: CacheService,
  ) {}

  // ── KPIs ──────────────────────────────────────────────────

  async getKPIs(campusId?: string) {
    const key = `analytics:kpis:${campusId ?? 'all'}`;
    return this.cache.getOrSet(key, async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        activeUsers,
        newUsersThisMonth,
        newUsersPrevMonth,
        activeGroups,
        newGroupsThisMonth,
        activeMemberships,
        newMembershipsThisMonth,
        newMembershipsPrevMonth,
        activeDiscipleships,
        completedMilestones,
        pendingCheckIns,
      ] = await Promise.all([
        this.repository.countActiveUsers(campusId),
        this.repository.countNewUsers(thirtyDaysAgo, undefined, campusId),
        this.repository.countNewUsers(sixtyDaysAgo, thirtyDaysAgo, campusId),
        this.repository.countActiveGroups(campusId),
        this.repository.countNewGroups(thirtyDaysAgo, campusId),
        this.repository.countActiveMemberships(),
        this.repository.countNewMemberships(thirtyDaysAgo),
        this.repository.countNewMemberships(sixtyDaysAgo, thirtyDaysAgo),
        this.repository.countActiveDiscipleships(),
        this.repository.countCompletedMilestones(),
        this.repository.countPendingCheckIns(now),
      ]);

      const pct = (curr: number, prev: number) =>
        prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

      return {
        users: {
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growthPct: pct(newUsersThisMonth, newUsersPrevMonth),
        },
        groups: { active: activeGroups, newThisMonth: newGroupsThisMonth },
        memberships: {
          active: activeMemberships,
          newThisMonth: newMembershipsThisMonth,
          growthPct: pct(newMembershipsThisMonth, newMembershipsPrevMonth),
        },
        discipleships: {
          active: activeDiscipleships,
          completedMilestones,
          pendingCheckIns,
        },
        generatedAt: now.toISOString(),
      };
    }, CACHE_TTL);
  }

  // ── Leaderboard: top leaders by disciple count ────────────

  async getLeaderboard(limit = 10) {
    const key = `analytics:leaderboard:${limit}`;
    return this.cache.getOrSet(key, async () => {
      const results = await this.repository.getTopMentors(limit);

      const mentorIds = results.map((r) => r.mentorId);
      const mentors = await this.repository.findUsersByIds(mentorIds);

      const mentorMap = Object.fromEntries(mentors.map((m) => [m.id, m]));

      return results.map((r, i) => ({
        rank: i + 1,
        mentor: mentorMap[r.mentorId],
        discipleCount: r._count.mentorId,
      }));
    }, CACHE_TTL);
  }

  // ── Group analytics: size distribution ───────────────────

  async getGroupAnalytics(campusId?: string) {
    const key = `analytics:groups:${campusId ?? 'all'}`;
    return this.cache.getOrSet(key, async () => {
      const byType = await this.repository.groupsByType(campusId);

      const topGroups = await this.repository.topGroupsByMembers(10);

      const groupIds = topGroups.map((g) => g.groupId);
      const groups = await this.repository.findGroupsByIds(groupIds);
      const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));

      return {
        byType: byType.map((t) => ({ type: t.type, count: t._count.type })),
        topByMembers: topGroups.map((g) => ({
          group: groupMap[g.groupId],
          memberCount: g._count.groupId,
        })),
      };
    }, CACHE_TTL);
  }

  // ── Retention: users active in last N days ────────────────

  async getRetentionMetrics() {
    const key = 'analytics:retention';
    return this.cache.getOrSet(key, async () => {
      const now = new Date();
      const windows = [7, 30, 90];

      const results = await Promise.all(
        windows.map(async (days) => {
          const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          const active = await this.repository.countActiveSessions(since);
          return { days, activeUsers: active };
        }),
      );

      return { windows: results, generatedAt: now.toISOString() };
    }, CACHE_TTL);
  }
}
