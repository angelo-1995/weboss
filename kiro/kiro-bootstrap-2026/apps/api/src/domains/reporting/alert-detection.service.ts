import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

/**
 * Alert Detection Service
 *
 * Detects pastoral operational anomalies and creates OperationalAlerts.
 * Designed to be called by a BullMQ cron job every 15 minutes.
 *
 * Rules:
 * - MISSING_REPORT: Groups with 2+ consecutive weeks without a report
 * - DECLINING_ATTENDANCE: Groups with 3+ consecutive weeks of declining attendance
 * - ZERO_VISITORS: Groups with 4+ consecutive weeks of 0 visitors
 */
@Injectable()
export class AlertDetectionService {
  private readonly logger = new Logger(AlertDetectionService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Run all alert detection checks.
   * Called by BullMQ cron job.
   */
  async detectAll(): Promise<{ missing: number; declining: number; zeroVisitors: number }> {
    const [missing, declining, zeroVisitors] = await Promise.all([
      this.detectMissingReports(),
      this.detectDecliningAttendance(),
      this.detectZeroVisitors(),
    ]);

    this.logger.log(`Alert detection complete: missing=${missing}, declining=${declining}, zeroVisitors=${zeroVisitors}`);
    return { missing, declining, zeroVisitors };
  }

  /**
   * Detect groups with 2+ consecutive weeks without a report.
   */
  async detectMissingReports(): Promise<number> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get all active groups
    const groups = await this.db.group.findMany({
      where: { isActive: true, deletedAt: null, type: 'CELL' },
      select: {
        id: true,
        name: true,
        campusId: true,
        members: {
          where: { role: 'LEADER', leftAt: null },
          select: { userId: true },
          take: 1,
        },
      },
    });

    // Get last report per group
    const latestReports = await this.db.cellReport.groupBy({
      by: ['groupId'],
      _max: { meetingDate: true },
    });
    const reportMap = new Map(latestReports.map((r) => [r.groupId, r._max.meetingDate]));

    let alertsCreated = 0;

    for (const group of groups) {
      const lastReport = reportMap.get(group.id);
      if (!lastReport || lastReport < twoWeeksAgo) {
        const leaderId = group.members[0]?.userId;
        if (!leaderId || !group.campusId) continue;

        // Check if an active alert already exists for this group
        const existingAlert = await this.db.operationalAlert.findFirst({
          where: {
            targetGroupId: group.id,
            type: 'MISSING_REPORT',
            acknowledged: false,
          },
        });

        if (!existingAlert) {
          const weeksMissing = lastReport
            ? Math.floor((Date.now() - lastReport.getTime()) / (7 * 24 * 60 * 60 * 1000))
            : 99;

          await this.db.operationalAlert.create({
            data: {
              campusId: group.campusId,
              type: 'MISSING_REPORT',
              targetGroupId: group.id,
              responsibleUserId: leaderId,
              message: `El equipo "${group.name}" no ha reportado en ${weeksMissing} semanas`,
              metadata: { weeksMissing, lastReportDate: lastReport?.toISOString() ?? null },
            },
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }

  /**
   * Detect groups with 3+ consecutive weeks of declining attendance.
   */
  async detectDecliningAttendance(): Promise<number> {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // Get reports from last 4 weeks for all groups
    const reports = await this.db.cellReport.findMany({
      where: { meetingDate: { gte: fourWeeksAgo } },
      select: { groupId: true, meetingDate: true, totalAttendance: true },
      orderBy: { meetingDate: 'asc' },
    });

    // Group by groupId
    const byGroup = new Map<string, Array<{ date: Date; attendance: number }>>();
    for (const r of reports) {
      if (!byGroup.has(r.groupId)) byGroup.set(r.groupId, []);
      byGroup.get(r.groupId)!.push({ date: r.meetingDate, attendance: r.totalAttendance });
    }

    let alertsCreated = 0;

    for (const [groupId, groupReports] of byGroup) {
      if (groupReports.length < 3) continue;

      // Check last 3 reports for consecutive decline
      const last3 = groupReports.slice(-3);
      const isDecline = last3[0].attendance > last3[1].attendance && last3[1].attendance > last3[2].attendance;

      if (isDecline) {
        // Get group info for alert
        const group = await this.db.group.findUnique({
          where: { id: groupId },
          select: {
            name: true,
            campusId: true,
            members: { where: { role: 'LEADER', leftAt: null }, select: { userId: true }, take: 1 },
          },
        });

        if (!group?.campusId || !group.members[0]) continue;

        const existingAlert = await this.db.operationalAlert.findFirst({
          where: { targetGroupId: groupId, type: 'DECLINING_ATTENDANCE', acknowledged: false },
        });

        if (!existingAlert) {
          await this.db.operationalAlert.create({
            data: {
              campusId: group.campusId,
              type: 'DECLINING_ATTENDANCE',
              targetGroupId: groupId,
              responsibleUserId: group.members[0].userId,
              message: `El equipo "${group.name}" tiene 3 semanas consecutivas de declive en asistencia`,
              metadata: { trend: last3.map((r) => r.attendance) },
            },
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }

  /**
   * Detect groups with 4+ consecutive weeks of zero visitors.
   */
  async detectZeroVisitors(): Promise<number> {
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);

    const reports = await this.db.cellReport.findMany({
      where: { meetingDate: { gte: fiveWeeksAgo } },
      select: { groupId: true, meetingDate: true, visitorsCount: true },
      orderBy: { meetingDate: 'asc' },
    });

    const byGroup = new Map<string, number[]>();
    for (const r of reports) {
      if (!byGroup.has(r.groupId)) byGroup.set(r.groupId, []);
      byGroup.get(r.groupId)!.push(r.visitorsCount);
    }

    let alertsCreated = 0;

    for (const [groupId, visitors] of byGroup) {
      if (visitors.length < 4) continue;

      const last4 = visitors.slice(-4);
      const allZero = last4.every((v) => v === 0);

      if (allZero) {
        const group = await this.db.group.findUnique({
          where: { id: groupId },
          select: {
            name: true,
            campusId: true,
            members: { where: { role: 'LEADER', leftAt: null }, select: { userId: true }, take: 1 },
          },
        });

        if (!group?.campusId || !group.members[0]) continue;

        const existingAlert = await this.db.operationalAlert.findFirst({
          where: { targetGroupId: groupId, type: 'ZERO_VISITORS', acknowledged: false },
        });

        if (!existingAlert) {
          await this.db.operationalAlert.create({
            data: {
              campusId: group.campusId,
              type: 'ZERO_VISITORS',
              targetGroupId: groupId,
              responsibleUserId: group.members[0].userId,
              message: `El equipo "${group.name}" no ha tenido visitantes en 4+ semanas`,
              metadata: { weeksWithoutVisitors: last4.length },
            },
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }
}
