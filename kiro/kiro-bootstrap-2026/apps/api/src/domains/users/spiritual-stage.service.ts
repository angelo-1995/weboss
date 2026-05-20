import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

const STAGE_ORDER = ['GANADO', 'CONSOLIDADO', 'DISCIPULADO', 'ENVIADO'] as const;

@Injectable()
export class SpiritualStageService {
  constructor(private readonly db: DatabaseService) {}

  async getStageStats() {
    const counts = await this.db.user.groupBy({
      by: ['spiritualStage'],
      _count: { id: true },
      where: { deletedAt: null, spiritualStage: { not: null } },
    });

    const stats: Record<string, number> = {
      GANADO: 0,
      CONSOLIDADO: 0,
      DISCIPULADO: 0,
      ENVIADO: 0,
    };

    for (const row of counts) {
      if (row.spiritualStage) {
        stats[row.spiritualStage] = row._count.id;
      }
    }

    return stats;
  }

  async getUsersByStage(stage: string, page = 1, pageSize = 20) {
    if (!STAGE_ORDER.includes(stage as any)) {
      throw new BadRequestException(`Invalid stage: ${stage}`);
    }

    const where = {
      deletedAt: null,
      spiritualStage: stage as any,
    };

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          leaderCode: true,
          spiritualStage: true,
          createdAt: true,
          isBaptized: true,
          hasFirstRetreat: true,
          hasAcademy: true,
          hasLaunch: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
  }

  async promoteUser(userId: string, toStage: string, promotedBy: string, notes?: string) {
    if (!STAGE_ORDER.includes(toStage as any)) {
      throw new BadRequestException(`Invalid stage: ${toStage}`);
    }

    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, spiritualStage: true, roles: true, leaderId: true, hasLaunch: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const currentIndex = user.spiritualStage
      ? STAGE_ORDER.indexOf(user.spiritualStage as any)
      : -1;
    const targetIndex = STAGE_ORDER.indexOf(toStage as any);

    if (targetIndex <= currentIndex) {
      throw new BadRequestException(
        'Solo se puede avanzar al siguiente nivel. No se permite retroceder.',
      );
    }

    // Validate Lanzamiento prerequisite for ENVIADO
    if (toStage === 'ENVIADO' && !user.hasLaunch) {
      throw new BadRequestException(
        'El usuario debe completar el Lanzamiento antes de ser enviado',
      );
    }

    // Create transition record
    await this.db.stageTransition.create({
      data: {
        userId,
        fromStage: user.spiritualStage ?? undefined,
        toStage: toStage as any,
        promotedBy,
        notes,
      },
    });

    // Update user stage + add LEADER role if ENVIADO
    const updateData: any = { spiritualStage: toStage };
    if (toStage === 'ENVIADO' && !user.roles.includes('LEADER')) {
      updateData.roles = { push: 'LEADER' };
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        spiritualStage: true,
        leaderCode: true,
        roles: true,
      },
    });

    // Auto-assign leader code when promoted to ENVIADO
    if (toStage === 'ENVIADO' && !updated.leaderCode) {
      const leaderCode = await this.assignLeaderCode(userId, promotedBy);
      return { ...updated, leaderCode };
    }

    return updated;
  }

  async getTransitionHistory(userId: string) {
    return this.db.stageTransition.findMany({
      where: { userId },
      include: {
        promoter: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignLeaderCode(userId: string, parentUserId?: string): Promise<string> {
    let parentCode: string | null = null;

    if (parentUserId) {
      const parent = await this.db.user.findFirst({
        where: { id: parentUserId, deletedAt: null },
        select: { leaderCode: true },
      });
      parentCode = parent?.leaderCode ?? null;
    }

    let newCode: string;

    if (parentCode) {
      // Count existing children under this parent code
      const childCount = await this.db.user.count({
        where: {
          leaderCode: { startsWith: `${parentCode}.` },
          deletedAt: null,
        },
      });
      newCode = `${parentCode}.${childCount + 1}`;
    } else {
      // Top-level: count existing P-level codes
      const topCount = await this.db.user.count({
        where: {
          leaderCode: { startsWith: 'P' },
          deletedAt: null,
        },
      });
      newCode = `P${topCount + 1}`;
    }

    await this.db.user.update({
      where: { id: userId },
      data: { leaderCode: newCode },
    });

    return newCode;
  }

  async getLeaderCode(userId: string) {
    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { leaderCode: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { leaderCode: user.leaderCode };
  }

  async getUnassignedUsers(page = 1, pageSize = 20) {
    const where = {
      deletedAt: null,
      spiritualStage: null,
    };

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          leaderCode: true,
          spiritualStage: true,
          createdAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, pageSize, hasNextPage: page * pageSize < total },
    };
  }

  async assignStage(userId: string, stage: string, assignedBy: string) {
    if (!STAGE_ORDER.includes(stage as any)) {
      throw new BadRequestException(`Invalid stage: ${stage}`);
    }

    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, spiritualStage: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // Create transition record
    await this.db.stageTransition.create({
      data: {
        userId,
        fromStage: user.spiritualStage ?? undefined,
        toStage: stage as any,
        promotedBy: assignedBy,
        notes: 'Asignación inicial de etapa',
      },
    });

    return this.db.user.update({
      where: { id: userId },
      data: { spiritualStage: stage as any },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        spiritualStage: true,
      },
    });
  }

  async updateMilestones(userId: string, data: {
    isBaptized?: boolean;
    baptizedDate?: string | null;
    hasFirstRetreat?: boolean;
    retreatDate?: string | null;
    hasAcademy?: boolean;
    academyDate?: string | null;
    hasLaunch?: boolean;
    launchDate?: string | null;
  }) {
    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.isBaptized !== undefined) updateData.isBaptized = data.isBaptized;
    if (data.baptizedDate !== undefined) updateData.baptizedDate = data.baptizedDate ? new Date(data.baptizedDate) : null;
    if (data.hasFirstRetreat !== undefined) updateData.hasFirstRetreat = data.hasFirstRetreat;
    if (data.retreatDate !== undefined) updateData.retreatDate = data.retreatDate ? new Date(data.retreatDate) : null;
    if (data.hasAcademy !== undefined) updateData.hasAcademy = data.hasAcademy;
    if (data.academyDate !== undefined) updateData.academyDate = data.academyDate ? new Date(data.academyDate) : null;
    if (data.hasLaunch !== undefined) updateData.hasLaunch = data.hasLaunch;
    if (data.launchDate !== undefined) updateData.launchDate = data.launchDate ? new Date(data.launchDate) : null;

    return this.db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        isBaptized: true,
        baptizedDate: true,
        hasFirstRetreat: true,
        retreatDate: true,
        hasAcademy: true,
        academyDate: true,
        hasLaunch: true,
        launchDate: true,
      },
    });
  }

  async getMilestones(userId: string) {
    const user = await this.db.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        isBaptized: true,
        baptizedDate: true,
        hasFirstRetreat: true,
        retreatDate: true,
        hasAcademy: true,
        academyDate: true,
        hasLaunch: true,
        launchDate: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
