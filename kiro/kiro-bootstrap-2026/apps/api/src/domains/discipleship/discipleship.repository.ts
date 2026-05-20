import { Injectable } from '@nestjs/common';
import { Prisma } from '@community-os/database';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { RelationshipsQueryDto } from './dto/discipleship.dto';

const USER_MINI = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const RELATIONSHIP_SELECT = {
  id: true,
  mentorId: true,
  discipleId: true,
  type: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  groupId: true,
  createdAt: true,
  updatedAt: true,
  mentor: { select: USER_MINI },
  disciple: { select: USER_MINI },
  group: { select: { id: true, name: true, slug: true } },
  _count: { select: { milestones: true, checkIns: true } },
} satisfies Prisma.DiscipleshipRelationshipSelect;

@Injectable()
export class DiscipleshipRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMany(query: RelationshipsQueryDto) {
    const { page, pageSize, mentorId, discipleId, type, status, groupId } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.DiscipleshipRelationshipWhereInput = {
      ...(mentorId && { mentorId }),
      ...(discipleId && { discipleId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(groupId && { groupId }),
    };

    const [data, total] = await Promise.all([
      this.db.discipleshipRelationship.findMany({
        where,
        select: RELATIONSHIP_SELECT,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.discipleshipRelationship.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.db.discipleshipRelationship.findUnique({
      where: { id },
      select: {
        ...RELATIONSHIP_SELECT,
        milestones: { orderBy: { order: 'asc' } },
        checkIns: { orderBy: { scheduledAt: 'desc' } },
      },
    });
  }

  async findExisting(mentorId: string, discipleId: string, type: string) {
    return this.db.discipleshipRelationship.findFirst({
      where: {
        mentorId,
        discipleId,
        type: type as never,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
    });
  }

  async create(data: Prisma.DiscipleshipRelationshipCreateInput) {
    return this.db.discipleshipRelationship.create({
      data,
      select: RELATIONSHIP_SELECT,
    });
  }

  async update(id: string, data: Prisma.DiscipleshipRelationshipUpdateInput) {
    return this.db.discipleshipRelationship.update({
      where: { id },
      data,
      select: RELATIONSHIP_SELECT,
    });
  }

  // ── Milestones ────────────────────────────────────────────

  async addMilestone(relationshipId: string, data: { title: string; description?: string; order: number }) {
    return this.db.discipleshipMilestone.create({
      data: { relationshipId, ...data },
    });
  }

  async completeMilestone(id: string, completedAt: Date) {
    return this.db.discipleshipMilestone.update({
      where: { id },
      data: { completedAt },
    });
  }

  async deleteMilestone(id: string) {
    return this.db.discipleshipMilestone.delete({ where: { id } });
  }

  // ── Check-ins ─────────────────────────────────────────────

  async addCheckIn(relationshipId: string, data: {
    notes?: string;
    rating?: number;
    scheduledAt: Date;
    attendedBy?: string[];
  }) {
    return this.db.discipleshipCheckIn.create({
      data: { relationshipId, ...data },
    });
  }

  async completeCheckIn(id: string, data: { notes?: string; rating?: number; completedAt: Date }) {
    return this.db.discipleshipCheckIn.update({
      where: { id },
      data,
    });
  }

  // ── Stats ─────────────────────────────────────────────────

  async getStats(userId: string) {
    const [asMentor, asDisciple] = await Promise.all([
      this.db.discipleshipRelationship.count({
        where: { mentorId: userId, status: 'ACTIVE' },
      }),
      this.db.discipleshipRelationship.count({
        where: { discipleId: userId, status: 'ACTIVE' },
      }),
    ]);

    const completedMilestones = await this.db.discipleshipMilestone.count({
      where: {
        completedAt: { not: null },
        relationship: { OR: [{ mentorId: userId }, { discipleId: userId }] },
      },
    });

    return { asMentor, asDisciple, completedMilestones };
  }

  // ── Tree: get full disciple tree under a mentor ───────────

  async getDiscipleTree(mentorId: string, depth = 0): Promise<unknown[]> {
    if (depth > 5) return []; // max depth guard

    const directDisciples = await this.db.discipleshipRelationship.findMany({
      where: { mentorId, status: 'ACTIVE', type: 'MENTOR_MENTEE' },
      select: {
        id: true,
        disciple: { select: USER_MINI },
        startDate: true,
      },
    });

    const tree = await Promise.all(
      directDisciples.map(async (rel) => ({
        ...rel,
        children: await this.getDiscipleTree(rel.disciple.id, depth + 1),
      })),
    );

    return tree;
  }

  // ── Cycle detection helper ────────────────────────────────

  /**
   * Find all active relationships where the given user is the MENTOR.
   * Used for BFS cycle detection.
   */
  async findActiveMentorships(mentorId: string): Promise<{ discipleId: string }[]> {
    return this.db.discipleshipRelationship.findMany({
      where: { mentorId, status: { in: ['ACTIVE', 'PAUSED'] } },
      select: { discipleId: true },
    });
  }

  // ── Full hierarchy tree (CTE recursive) ───────────────────

  /**
   * Get the full discipleship tree for a user (both ascendants and descendants)
   * using a recursive CTE query for efficiency.
   */
  async getFullHierarchy(userId: string, maxDepth = 10): Promise<{
    ancestors: unknown[];
    descendants: unknown[];
  }> {
    // Ancestors: traverse UP (where user is disciple)
    const ancestors = await this.db.$queryRaw<Array<{ id: string; mentor_id: string; disciple_id: string; type: string; status: string; depth: number }>>`
      WITH RECURSIVE ancestors AS (
        SELECT id, mentor_id, disciple_id, type, status, 1 as depth
        FROM discipleship_relationships
        WHERE disciple_id = ${userId} AND status IN ('ACTIVE', 'PAUSED')
        UNION ALL
        SELECT dr.id, dr.mentor_id, dr.disciple_id, dr.type, dr.status, a.depth + 1
        FROM discipleship_relationships dr
        INNER JOIN ancestors a ON dr.disciple_id = a.mentor_id
        WHERE dr.status IN ('ACTIVE', 'PAUSED') AND a.depth < ${maxDepth}
      )
      SELECT * FROM ancestors ORDER BY depth ASC
    `;

    // Descendants: traverse DOWN (where user is mentor)
    const descendants = await this.db.$queryRaw<Array<{ id: string; mentor_id: string; disciple_id: string; type: string; status: string; depth: number }>>`
      WITH RECURSIVE descendants AS (
        SELECT id, mentor_id, disciple_id, type, status, 1 as depth
        FROM discipleship_relationships
        WHERE mentor_id = ${userId} AND status IN ('ACTIVE', 'PAUSED')
        UNION ALL
        SELECT dr.id, dr.mentor_id, dr.disciple_id, dr.type, dr.status, d.depth + 1
        FROM discipleship_relationships dr
        INNER JOIN descendants d ON dr.mentor_id = d.disciple_id
        WHERE dr.status IN ('ACTIVE', 'PAUSED') AND d.depth < ${maxDepth}
      )
      SELECT * FROM descendants ORDER BY depth ASC
    `;

    return { ancestors, descendants };
  }
}
