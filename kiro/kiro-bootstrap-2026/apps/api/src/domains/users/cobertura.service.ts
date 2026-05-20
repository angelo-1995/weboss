import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

interface CoberturaNode {
  id: string;
  name: string;
  spouseName: string | null;
  leaderCode: string | null;
  networkName: string | null;
  subordinateCount: number;
  children: CoberturaNode[];
}

@Injectable()
export class CoberturaService {
  constructor(private readonly db: DatabaseService) {}

  async getCoberturaTree(): Promise<CoberturaNode[]> {
    // Get all active users with leadership info
    const users = await this.db.user.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        leaderCode: true,
        leaderId: true,
        spouseId: true,
        roles: true,
        network: { select: { name: true } },
        spouse: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Build a map of userId -> user data
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.id, u);
    }

    // Track which users are spouses (to avoid duplicating them as separate nodes)
    const spouseIds = new Set<string>();
    for (const u of users) {
      if (u.spouseId && userMap.has(u.spouseId)) {
        spouseIds.add(u.spouseId);
      }
    }

    // Build parent-children map using leaderId
    const childrenMap = new Map<string, any[]>();
    const rootUsers: any[] = [];

    for (const u of users) {
      // Skip users that are spouses of another user (they'll be shown together)
      if (spouseIds.has(u.id) && u.leaderId && userMap.has(u.leaderId)) {
        // Only skip if the spouse's leader is the same as the primary user's leader
        // or if the primary user (their spouse) is already in the tree
        const primarySpouse = userMap.get(u.spouseId!);
        if (primarySpouse && !spouseIds.has(primarySpouse.id)) {
          continue;
        }
      }

      if (!u.leaderId || !userMap.has(u.leaderId)) {
        // Root node: no leader or leader not in active users (e.g., SUPER_ADMIN)
        rootUsers.push(u);
      } else {
        const parentId = u.leaderId;
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(u);
      }
    }

    // Count all subordinates recursively
    const countSubordinates = (userId: string): number => {
      const children = childrenMap.get(userId) || [];
      let count = children.length;
      for (const child of children) {
        count += countSubordinates(child.id);
      }
      return count;
    };

    // Build tree recursively
    const buildNode = (u: any): CoberturaNode => {
      const spouse = u.spouseId ? userMap.get(u.spouseId) : null;
      const spouseName = spouse ? `${spouse.firstName} ${spouse.lastName}` : null;

      const children = (childrenMap.get(u.id) || [])
        .filter((child: any) => {
          // Don't show the spouse as a child
          if (spouse && child.id === spouse.id) return false;
          return true;
        })
        .map((child: any) => buildNode(child));

      // Also include children of the spouse
      if (spouse) {
        const spouseChildren = (childrenMap.get(spouse.id) || [])
          .filter((child: any) => child.id !== u.id)
          .map((child: any) => buildNode(child));
        children.push(...spouseChildren);
      }

      const subordinateCount = countSubordinates(u.id) + (spouse ? countSubordinates(spouse.id) : 0);

      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        spouseName,
        leaderCode: u.leaderCode,
        networkName: u.network?.name ?? null,
        subordinateCount,
        children,
      };
    };

    // Filter root users: skip those that are just spouses
    const filteredRoots = rootUsers.filter((u) => {
      if (spouseIds.has(u.id)) {
        // Check if their spouse is also a root
        const primarySpouse = userMap.get(u.spouseId!);
        if (primarySpouse && rootUsers.some((r) => r.id === primarySpouse.id)) {
          return false;
        }
      }
      return true;
    });

    return filteredRoots.map(buildNode);
  }
}
