import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

const KPI_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class DashboardKpisService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Get pastoral KPIs for the executive dashboard.
   * Scoped by campus, optional network filter, and ministerial scope (ADR-010).
   */
  async getKPIs(campusId: string, networkId?: string, visibleGroupIds?: string[] | null, leaderCode?: string | null) {
    const key = `dashboard:kpis:${campusId}:${networkId ?? 'all'}:${leaderCode ?? 'global'}`;

    return this.cache.getOrSet(key, async () => {
      const now = new Date();
      const thisWeekStart = this.getWeekStart(now);
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const fourWeeksAgo = new Date(thisWeekStart);
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

      let groupIds: string[];

      // ADR-010: If visibleGroupIds is provided, use them directly (scoped user)
      if (visibleGroupIds) {
        groupIds = visibleGroupIds;
      } else {
        // Admin or no scope: query all groups by campus/network
        const groupFilter: any = { isActive: true, deletedAt: null, type: 'CELL' };
        if (campusId) groupFilter.campusId = campusId;
        if (networkId) groupFilter.networkId = networkId;

        const groups = await this.db.group.findMany({
          where: groupFilter,
          select: { id: true },
        });
        groupIds = groups.map((g) => g.id);
      }

      if (groupIds.length === 0) {
        return this.emptyKPIs(now);
      }

      // This week reports
      const thisWeekReports = await this.db.cellReport.findMany({
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: thisWeekStart },
        },
        select: { totalAttendance: true, visitorsCount: true, convertsCount: true, offeringAmount: true },
      });

      // Last week reports
      const lastWeekReports = await this.db.cellReport.findMany({
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: lastWeekStart, lt: thisWeekStart },
        },
        select: { totalAttendance: true, visitorsCount: true, convertsCount: true, offeringAmount: true },
      });

      // Active groups (reported in last 4 weeks)
      const activeGroupsResult = await this.db.cellReport.groupBy({
        by: ['groupId'],
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: fourWeeksAgo },
        },
      });

      // Sums
      const sumAttendance = (reports: any[]) => reports.reduce((sum, r) => sum + r.totalAttendance, 0);
      const sumVisitors = (reports: any[]) => reports.reduce((sum, r) => sum + r.visitorsCount, 0);
      const sumConverts = (reports: any[]) => reports.reduce((sum, r) => sum + r.convertsCount, 0);
      const sumOffering = (reports: any[]) => reports.reduce((sum, r) => sum + Number(r.offeringAmount ?? 0), 0);

      const thisWeekAttendance = sumAttendance(thisWeekReports);
      const lastWeekAttendance = sumAttendance(lastWeekReports);
      const thisWeekVisitors = sumVisitors(thisWeekReports);
      const lastWeekVisitors = sumVisitors(lastWeekReports);
      const thisWeekConverts = sumConverts(thisWeekReports);
      const thisWeekOffering = sumOffering(thisWeekReports);
      const lastWeekOffering = sumOffering(lastWeekReports);

      const activeGroupsCount = activeGroupsResult.length;
      const totalGroups = groupIds.length;
      const reportedThisWeek = thisWeekReports.length;
      const compliance = totalGroups > 0 ? Math.round((reportedThisWeek / totalGroups) * 100) : 0;

      const pctChange = (curr: number, prev: number) =>
        prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

      return {
        attendance: {
          value: thisWeekAttendance,
          previousValue: lastWeekAttendance,
          change: pctChange(thisWeekAttendance, lastWeekAttendance),
        },
        visitors: {
          value: thisWeekVisitors,
          previousValue: lastWeekVisitors,
          change: thisWeekVisitors - lastWeekVisitors,
        },
        converts: {
          value: thisWeekConverts,
        },
        offering: {
          value: thisWeekOffering,
          previousValue: lastWeekOffering,
          change: pctChange(thisWeekOffering, lastWeekOffering),
          currency: 'PAB',
        },
        activeGroups: {
          value: activeGroupsCount,
          total: totalGroups,
        },
        compliance: {
          value: compliance,
          reported: reportedThisWeek,
          total: totalGroups,
        },
        generatedAt: now.toISOString(),
      };
    }, KPI_CACHE_TTL);
  }

  /**
   * Get attendance trend for the last N weeks.
   * ADR-010: Scoped by visibleGroupIds when non-null.
   */
  async getAttendanceTrend(campusId: string, weeks = 12, networkId?: string, visibleGroupIds?: string[] | null, leaderCode?: string | null) {
    const key = `dashboard:trend:${campusId}:${networkId ?? 'all'}:${weeks}:${leaderCode ?? 'global'}`;

    return this.cache.getOrSet(key, async () => {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - weeks * 7);

      let groupIds: string[];

      // ADR-010: If visibleGroupIds is provided, use them directly (scoped user)
      if (visibleGroupIds) {
        groupIds = visibleGroupIds;
      } else {
        const groupFilter: any = { isActive: true, deletedAt: null, type: 'CELL' };
        if (campusId) groupFilter.campusId = campusId;
        if (networkId) groupFilter.networkId = networkId;

        const groups = await this.db.group.findMany({
          where: groupFilter,
          select: { id: true },
        });
        groupIds = groups.map((g) => g.id);
      }

      const reports = await this.db.cellReport.findMany({
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: startDate },
        },
        select: { meetingDate: true, totalAttendance: true, visitorsCount: true, convertsCount: true },
        orderBy: { meetingDate: 'asc' },
      });

      // Aggregate by week
      const weeklyData = new Map<string, { attendance: number; visitors: number; converts: number; reports: number }>();

      for (const report of reports) {
        const weekKey = this.getWeekStart(report.meetingDate).toISOString().split('T')[0];
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, { attendance: 0, visitors: 0, converts: 0, reports: 0 });
        }
        const week = weeklyData.get(weekKey)!;
        week.attendance += report.totalAttendance;
        week.visitors += report.visitorsCount;
        week.converts += report.convertsCount;
        week.reports++;
      }

      return {
        weeks: Array.from(weeklyData.entries()).map(([weekStart, data]) => ({
          weekStart,
          ...data,
        })),
        generatedAt: now.toISOString(),
      };
    }, KPI_CACHE_TTL);
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private emptyKPIs(now: Date) {
    return {
      attendance: { value: 0, previousValue: 0, change: 0 },
      visitors: { value: 0, previousValue: 0, change: 0 },
      converts: { value: 0 },
      offering: { value: 0, previousValue: 0, change: 0, currency: 'PAB' },
      activeGroups: { value: 0, total: 0 },
      compliance: { value: 0, reported: 0, total: 0 },
      generatedAt: now.toISOString(),
    };
  }
}
