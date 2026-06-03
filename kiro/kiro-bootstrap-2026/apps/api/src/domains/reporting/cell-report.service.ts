import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { HierarchyVisibilityService } from '../../common/services/hierarchy-visibility.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { CreateCellReportDto, CellReportQueryDto } from './dto/cell-report.dto';

@Injectable()
export class CellReportService {
  private readonly logger = new Logger(CellReportService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly visibility: HierarchyVisibilityService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Get Monday 00:00:00 to Sunday 23:59:59 for a given date
   */
  getWeekBoundaries(date: Date): { monday: Date; sunday: Date } {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  }

  async create(dto: CreateCellReportDto, reporterId: string): Promise<any> {
    // 1. Validate meetingDate is not in the future
    const meetingDate = new Date(dto.meetingDate);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (meetingDate > now) {
      throw new BadRequestException('La fecha de reunión no puede ser futura');
    }

    // 2. Validate reporter is LEADER or CO_LEADER in the group
    const membership = await this.db.groupMember.findFirst({
      where: {
        groupId: dto.groupId,
        userId: reporterId,
        role: { in: ['LEADER', 'CO_LEADER'] },
        leftAt: null,
      },
    });

    // Also allow ADMIN/SUPER_ADMIN (check user roles)
    if (!membership) {
      const user = await this.db.user.findUnique({
        where: { id: reporterId },
        select: { roles: true },
      });
      const isAdmin = user?.roles.some((r: string) =>
        ['ADMIN', 'SUPER_ADMIN'].includes(r),
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          'Solo el líder o co-líder de la célula puede enviar el reporte',
        );
      }
    }

    // 3. Check week uniqueness
    const { monday, sunday } = this.getWeekBoundaries(meetingDate);
    const existing = await this.db.cellReport.findFirst({
      where: {
        groupId: dto.groupId,
        meetingDate: { gte: monday, lte: sunday },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un reporte para esta célula en la semana indicada',
      );
    }

    // 4. Compute totalAttendance
    const totalAttendance =
      dto.menCount +
      dto.womenCount +
      dto.youthMaleCount +
      dto.youthFemaleCount +
      dto.childrenCount;

    // 5. Create
    const report = await this.db.cellReport.create({
      data: {
        groupId: dto.groupId,
        reporterId,
        cellCode: dto.cellCode,
        meetingDate,
        coverageName: dto.coverageName,
        leaderName: dto.leaderName,
        coLeaderName: dto.coLeaderName,
        contactPhone: dto.contactPhone,
        menCount: dto.menCount,
        womenCount: dto.womenCount,
        youthMaleCount: dto.youthMaleCount,
        youthFemaleCount: dto.youthFemaleCount,
        childrenCount: dto.childrenCount,
        totalAttendance,
        visitorsCount: dto.visitorsCount,
        convertsCount: dto.convertsCount,
        reconciledCount: dto.reconciledCount,
        messageTopic: dto.messageTopic,
        startTime: dto.startTime,
        endTime: dto.endTime,
        offeringAmount: dto.offeringAmount,
        district: dto.district,
        neighborhood: dto.neighborhood,
        sector: dto.sector,
        street: dto.street,
        houseNumber: dto.houseNumber,
        wasSupervised: dto.wasSupervised ?? false,
        observations: dto.observations,
      },
      include: {
        group: { select: { id: true, name: true } },
        reporter: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Invalidate dashboard cache so KPIs reflect the new report immediately
    try {
      await this.cache.delPattern('dashboard:*');
    } catch (err) {
      this.logger.warn(`Cache invalidation failed after report creation: ${err}`);
    }

    return report;
  }

  async findAll(query: CellReportQueryDto, userId: string, roles: string[]): Promise<any> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    // Hierarchical visibility: filter by visible groups based on leaderCode
    const visibleGroupIds = await this.visibility.getVisibleGroupIds(userId, roles);
    if (visibleGroupIds !== null) {
      // Not admin — restrict to visible groups
      where.groupId = { in: visibleGroupIds };
    }

    // Apply filters
    if (query.groupId) {
      where.groupId = query.groupId;
    }

    if (query.networkId) {
      // Filter by network: get groups in that network
      const networkGroups = await this.db.group.findMany({
        where: { networkId: query.networkId },
        select: { id: true },
      });
      const networkGroupIds = networkGroups.map((g) => g.id);
      if (where.groupId && typeof where.groupId === 'object') {
        // Intersect with existing filter
        const existing = (where.groupId as any).in as string[];
        where.groupId = { in: existing.filter((id: string) => networkGroupIds.includes(id)) };
      } else if (!where.groupId) {
        where.groupId = { in: networkGroupIds };
      }
    }

    if (query.startDate || query.endDate) {
      where.meetingDate = {
        ...(query.startDate && { gte: new Date(query.startDate) }),
        ...(query.endDate && { lte: new Date(query.endDate) }),
      };
    }

    const [data, total] = await Promise.all([
      this.db.cellReport.findMany({
        where,
        include: {
          group: { select: { id: true, name: true } },
          reporter: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { meetingDate: 'desc' },
        skip,
        take: pageSize,
      }),
      this.db.cellReport.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findPending(userId: string, roles: string[]) {
    // Get current week boundaries
    const { monday, sunday } = this.getWeekBoundaries(new Date());

    // Get visible groups based on hierarchy
    const visibleGroupIds = await this.visibility.getVisibleGroupIds(userId, roles);

    let groupsToCheck: { groupId: string; groupName: string; leaderName: string }[];

    if (visibleGroupIds === null) {
      // Admin: all active groups
      const groups = await this.db.group.findMany({
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          members: {
            where: { role: 'LEADER', leftAt: null },
            select: { user: { select: { firstName: true, lastName: true } } },
            take: 1,
          },
        },
      });
      groupsToCheck = groups.map((g) => ({
        groupId: g.id,
        groupName: g.name,
        leaderName: g.members[0]
          ? `${g.members[0].user.firstName} ${g.members[0].user.lastName}`
          : 'Sin líder',
      }));
    } else {
      // Filtered by hierarchy
      const groups = await this.db.group.findMany({
        where: { id: { in: visibleGroupIds }, isActive: true, deletedAt: null },
        select: {
          id: true,
          name: true,
          members: {
            where: { role: 'LEADER', leftAt: null },
            select: { user: { select: { firstName: true, lastName: true } } },
            take: 1,
          },
        },
      });
      groupsToCheck = groups.map((g) => ({
        groupId: g.id,
        groupName: g.name,
        leaderName: g.members[0]
          ? `${g.members[0].user.firstName} ${g.members[0].user.lastName}`
          : 'Sin líder',
      }));
    }

    if (groupsToCheck.length === 0) return [];

    // Find which groups already have a report this week
    const existingReports = await this.db.cellReport.findMany({
      where: {
        groupId: { in: groupsToCheck.map((g) => g.groupId) },
        meetingDate: { gte: monday, lte: sunday },
      },
      select: { groupId: true },
    });

    const reportedGroupIds = new Set(existingReports.map((r) => r.groupId));

    return groupsToCheck.filter((g) => !reportedGroupIds.has(g.groupId));
  }

  /**
   * Lookup cell info by group ID.
   * Given a groupId, returns:
   * - code (group.code)
   * - leader name (user with LEADER role in the group)
   * - co-leader name (user with CO_LEADER role)
   * - coverage name (leader's coverageLeader)
   * - phone (leader's phone)
   * - location (group's geographic fields)
   */
  async lookupByGroup(groupId: string): Promise<any> {
    if (!groupId) {
      return { code: null, leader: null, coLeader: null, coverage: null, phone: null, location: null };
    }

    const group = await this.db.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        code: true,
        country: true,
        province: true,
        district: true,
        corregimiento: true,
        neighborhood: true,
        street: true,
        houseNumber: true,
        members: {
          where: { leftAt: null, role: { in: ['LEADER', 'CO_LEADER'] } },
          select: {
            role: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                leaderId: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return { code: null, leader: null, coLeader: null, coverage: null, phone: null, location: null };
    }

    const leaderMember = group.members.find((m) => m.role === 'LEADER');
    const coLeaderMember = group.members.find((m) => m.role === 'CO_LEADER');

    const leaderName = leaderMember
      ? `${leaderMember.user.firstName} ${leaderMember.user.lastName}`
      : null;
    const coLeaderName = coLeaderMember
      ? `${coLeaderMember.user.firstName} ${coLeaderMember.user.lastName}`
      : null;
    const phone = leaderMember?.user.phoneNumber ?? null;

    // Get coverage: the leader's coverageLeader (leaderId)
    let coverageName: string | null = null;
    if (leaderMember?.user.leaderId) {
      const coverageUser = await this.db.user.findUnique({
        where: { id: leaderMember.user.leaderId },
        select: { firstName: true, lastName: true },
      });
      if (coverageUser) {
        coverageName = `${coverageUser.firstName} ${coverageUser.lastName}`;
      }
    }

    return {
      code: group.code ?? null,
      leader: leaderName,
      coLeader: coLeaderName,
      coverage: coverageName,
      phone,
      location: {
        country: group.country ?? 'Panamá',
        province: group.province ?? '',
        district: group.district ?? '',
        corregimiento: group.corregimiento ?? '',
        neighborhood: group.neighborhood ?? '',
        street: group.street ?? '',
        houseNumber: group.houseNumber ?? '',
      },
    };
  }

  /**
   * Lookup cell info by code.
   * Given a cell code (e.g. "E5.1"), returns:
   * - leader name (user with LEADER role in the group that has this code)
   * - co-leader name (user with CO_LEADER role)
   * - coverage name (user whose leaderCode matches the parent code, e.g. "E5")
   * - group info
   */
  async lookupByCode(code: string): Promise<any> {
    if (!code || code.trim().length === 0) {
      return { leader: null, coLeader: null, coverage: null, group: null };
    }

    const trimmedCode = code.trim();

    // Find a user with this leaderCode who is a LEADER in a group
    const leaderUser = await this.db.user.findFirst({
      where: { leaderCode: trimmedCode, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        groupMembers: {
          where: { role: 'LEADER', leftAt: null },
          select: { groupId: true, group: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    });

    let groupId: string | null = null;
    let groupName: string | null = null;
    let leaderName: string | null = null;
    let leaderPhone: string | null = null;

    if (leaderUser) {
      leaderName = `${leaderUser.firstName} ${leaderUser.lastName}`;
      leaderPhone = leaderUser.phoneNumber;
      if (leaderUser.groupMembers.length > 0) {
        groupId = leaderUser.groupMembers[0].groupId;
        groupName = leaderUser.groupMembers[0].group.name;
      }
    }

    // Find co-leader in the same group
    let coLeaderName: string | null = null;
    if (groupId) {
      const coLeader = await this.db.groupMember.findFirst({
        where: { groupId, role: 'CO_LEADER', leftAt: null },
        select: { user: { select: { firstName: true, lastName: true } } },
      });
      if (coLeader) {
        coLeaderName = `${coLeader.user.firstName} ${coLeader.user.lastName}`;
      }
    }

    // Find coverage: parent code = code without last segment
    // E.g. "E5.1" → parent is "E5", "P1.1.2" → parent is "P1.1"
    let coverageName: string | null = null;
    const lastDotIndex = trimmedCode.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const parentCode = trimmedCode.substring(0, lastDotIndex);
      const coverageUser = await this.db.user.findFirst({
        where: { leaderCode: parentCode, deletedAt: null },
        select: { firstName: true, lastName: true },
      });
      if (coverageUser) {
        coverageName = `${coverageUser.firstName} ${coverageUser.lastName}`;
      }
    }

    return {
      group: groupId ? { id: groupId, name: groupName } : null,
      leader: leaderName,
      coLeader: coLeaderName,
      coverage: coverageName,
      phone: leaderPhone,
    };
  }
}
