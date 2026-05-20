import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type SearchEntity = 'users' | 'groups' | 'discipleship' | 'all';

export interface SearchResult {
  id: string;
  type: 'users' | 'groups' | 'discipleship';
  title: string;
  subtitle?: string;
  rank?: number;
  meta?: Record<string, unknown>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private ftsAvailable: boolean | null = null;

  constructor(private readonly db: DatabaseService) {}

  /**
   * Global search across users, groups, and discipleship relationships.
   * Uses PostgreSQL tsvector when available, falls back to ILIKE.
   */
  async globalSearch(query: string, limit = 10): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim();
    const perType = Math.min(50, limit);

    const [users, groups, relationships] = await Promise.all([
      this.searchUsers(q, perType),
      this.searchGroups(q, perType),
      this.searchDiscipleship(q, Math.ceil(perType / 3)),
    ]);

    // Merge and sort by rank (relevance) if available
    const all = [...users, ...groups, ...relationships]
      .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0))
      .slice(0, limit);

    return all;
  }

  async searchUsers(query: string, limit = 50): Promise<SearchResult[]> {
    const useFts = await this.isFtsAvailable();

    if (useFts) {
      return this.searchUsersFts(query, limit);
    }

    return this.searchUsersIlike(query, limit);
  }

  async searchGroups(query: string, limit = 50): Promise<SearchResult[]> {
    const useFts = await this.isFtsAvailable();

    if (useFts) {
      return this.searchGroupsFts(query, limit);
    }

    return this.searchGroupsIlike(query, limit);
  }

  async searchDiscipleship(query: string, limit = 20): Promise<SearchResult[]> {
    const results = await this.db.discipleshipRelationship.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { mentor: { firstName: { contains: query, mode: 'insensitive' } } },
          { mentor: { lastName: { contains: query, mode: 'insensitive' } } },
          { disciple: { firstName: { contains: query, mode: 'insensitive' } } },
          { disciple: { lastName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        type: true,
        mentor: { select: { firstName: true, lastName: true } },
        disciple: { select: { firstName: true, lastName: true } },
      },
      take: limit,
    });

    return results.map((r) => ({
      id: r.id,
      type: 'discipleship' as const,
      title: `${r.mentor.firstName} → ${r.disciple.firstName} ${r.disciple.lastName}`,
      subtitle: r.type,
      rank: 0.5,
    }));
  }

  // ── FTS (tsvector) implementations ────────────────────────

  private async searchUsersFts(query: string, limit: number): Promise<SearchResult[]> {
    const tsQuery = this.toTsQuery(query);

    const results = await this.db.$queryRaw<Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar_url: string | null;
      rank: number;
    }>>`
      SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url,
             ts_rank(u.search_vector, to_tsquery('simple', ${tsQuery})) as rank
      FROM users u
      WHERE u.deleted_at IS NULL
        AND u.status = 'ACTIVE'
        AND u.search_vector @@ to_tsquery('simple', ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    return results.map((u) => ({
      id: u.id,
      type: 'users' as const,
      title: `${u.first_name} ${u.last_name}`,
      subtitle: u.email,
      rank: u.rank,
      meta: { avatarUrl: u.avatar_url },
    }));
  }

  private async searchGroupsFts(query: string, limit: number): Promise<SearchResult[]> {
    const tsQuery = this.toTsQuery(query);

    const results = await this.db.$queryRaw<Array<{
      id: string;
      name: string;
      slug: string;
      type: string;
      member_count: number;
      rank: number;
    }>>`
      SELECT g.id, g.name, g.slug, g.type,
             (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id AND gm.left_at IS NULL) as member_count,
             ts_rank(g.search_vector, to_tsquery('simple', ${tsQuery})) as rank
      FROM groups g
      WHERE g.deleted_at IS NULL
        AND g.is_active = true
        AND g.search_vector @@ to_tsquery('simple', ${tsQuery})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    return results.map((g) => ({
      id: g.id,
      type: 'groups' as const,
      title: g.name,
      subtitle: `/${g.slug} · ${g.type}`,
      rank: g.rank,
      meta: { memberCount: Number(g.member_count) },
    }));
  }

  // ── ILIKE fallback implementations ────────────────────────

  private async searchUsersIlike(query: string, limit: number): Promise<SearchResult[]> {
    const results = await this.db.user.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        roles: true,
      },
      take: limit,
    });

    return results.map((u) => ({
      id: u.id,
      type: 'users' as const,
      title: `${u.firstName} ${u.lastName}`,
      subtitle: u.email,
      rank: 0.5,
      meta: { avatarUrl: u.avatarUrl, roles: u.roles },
    }));
  }

  private async searchGroupsIlike(query: string, limit: number): Promise<SearchResult[]> {
    const results = await this.db.group.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        _count: { select: { members: { where: { leftAt: null } } } },
      },
      take: limit,
    });

    return results.map((g) => ({
      id: g.id,
      type: 'groups' as const,
      title: g.name,
      subtitle: `/${g.slug} · ${g.type}`,
      rank: 0.5,
      meta: { memberCount: g._count.members },
    }));
  }

  // ── Helpers ───────────────────────────────────────────────

  /**
   * Convert a user query string to a PostgreSQL tsquery format.
   * Splits words and joins with & (AND) for prefix matching.
   */
  private toTsQuery(query: string): string {
    return query
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map((w) => `${w}:*`)
      .join(' & ');
  }

  /**
   * Check if tsvector columns exist (cached after first check).
   */
  private async isFtsAvailable(): Promise<boolean> {
    if (this.ftsAvailable !== null) return this.ftsAvailable;

    try {
      await this.db.$queryRaw`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'search_vector'
      `;
      const result = await this.db.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'search_vector'
      `;
      this.ftsAvailable = result.length > 0;
    } catch {
      this.ftsAvailable = false;
    }

    this.logger.log(`FTS (tsvector) available: ${this.ftsAvailable}`);
    return this.ftsAvailable;
  }
}
