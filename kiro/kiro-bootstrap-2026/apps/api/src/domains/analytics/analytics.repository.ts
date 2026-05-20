import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: DatabaseService) {}

  // ── KPI queries ───────────────────────────────────────────

  async countActiveUsers(campusId?: string) {
    return this.db.user.count({
      where: { deletedAt: null, status: 'ACTIVE', ...(campusId && { campusId }) },
    });
  }

  async countNewUsers(since: Date, until?: Date, campusId?: string) {
    return this.db.user.count({
      where: {
        deletedAt: null,
        ...(campusId && { campusId }),
        createdAt: { gte: since, ...(until && { lt: until }) },
      },
    });
  }

  async countActiveGroups(campusId?: string) {
    return this.db.group.count({
      where: { deletedAt: null, isActive: true, ...(campusId && { campusId }) },
    });
  }

  async countNewGroups(since: Date, campusId?: string) {
    return this.db.group.count({
      where: { deletedAt: null, ...(campusId && { campusId }), createdAt: { gte: since } },
    });
  }

  async countActiveMemberships() {
    return this.db.membership.count({ where: { status: 'ACTIVE' } });
  }

  async countNewMemberships(since: Date, until?: Date) {
    return this.db.membership.count({
      where: { startDate: { gte: since, ...(until && { lt: until }) } },
    });
  }

  async countActiveDiscipleships() {
    return this.db.discipleshipRelationship.count({ where: { status: 'ACTIVE' } });
  }

  async countCompletedMilestones() {
    return this.db.discipleshipMilestone.count({ where: { completedAt: { not: null } } });
  }

  async countPendingCheckIns(before: Date) {
    return this.db.discipleshipCheckIn.count({
      where: { completedAt: null, scheduledAt: { lte: before } },
    });
  }

  // ── Leaderboard queries ───────────────────────────────────

  async getTopMentors(limit: number) {
    return this.db.discipleshipRelationship.groupBy({
      by: ['mentorId'],
      where: { status: 'ACTIVE' },
      _count: { mentorId: true },
      orderBy: { _count: { mentorId: 'desc' } },
      take: limit,
    });
  }

  async findUsersByIds(ids: string[]) {
    return this.db.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, campusId: true },
    });
  }

  // ── Group analytics queries ───────────────────────────────

  async groupsByType(campusId?: string) {
    return this.db.group.groupBy({
      by: ['type'],
      where: { deletedAt: null, isActive: true, ...(campusId && { campusId }) },
      _count: { type: true },
    });
  }

  async topGroupsByMembers(limit: number) {
    return this.db.groupMember.groupBy({
      by: ['groupId'],
      where: { leftAt: null },
      _count: { groupId: true },
      orderBy: { _count: { groupId: 'desc' } },
      take: limit,
    });
  }

  async findGroupsByIds(ids: string[]) {
    return this.db.group.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, type: true },
    });
  }

  // ── Retention queries ─────────────────────────────────────

  async countActiveSessions(since: Date) {
    return this.db.session.count({
      where: { createdAt: { gte: since }, revokedAt: null },
    });
  }
}
