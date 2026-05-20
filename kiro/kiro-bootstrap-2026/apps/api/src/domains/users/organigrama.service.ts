import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

interface OrganigramaNode {
  id: string;
  fullName: string;
  role: string;
  networkId: string | null;
  networkName: string | null;
  phone: string | null;
  leaderCode: string | null;
  leaderId: string | null;
}

interface OrganigramaEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface OrganigramaResponse {
  nodes: OrganigramaNode[];
  edges: OrganigramaEdge[];
}

@Injectable()
export class OrganigramaService {
  constructor(private readonly db: DatabaseService) {}

  async getOrganigrama(): Promise<OrganigramaResponse> {
    // Get all COVERAGE relationships that are ACTIVE
    const relationships = await this.db.discipleshipRelationship.findMany({
      where: {
        type: 'COVERAGE',
        status: 'ACTIVE',
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            roles: true,
            networkId: true,
            phoneNumber: true,
            leaderCode: true,
            leaderId: true,
            network: { select: { name: true } },
          },
        },
        disciple: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            roles: true,
            networkId: true,
            phoneNumber: true,
            leaderCode: true,
            leaderId: true,
            network: { select: { name: true } },
          },
        },
      },
    });

    // Build unique nodes map
    const nodesMap = new Map<string, OrganigramaNode>();

    for (const rel of relationships) {
      if (!nodesMap.has(rel.mentor.id)) {
        nodesMap.set(rel.mentor.id, {
          id: rel.mentor.id,
          fullName: `${rel.mentor.firstName} ${rel.mentor.lastName}`,
          role: rel.mentor.roles[0] ?? 'MEMBER',
          networkId: rel.mentor.networkId,
          networkName: rel.mentor.network?.name ?? null,
          phone: rel.mentor.phoneNumber,
          leaderCode: rel.mentor.leaderCode,
          leaderId: rel.mentor.leaderId,
        });
      }

      if (!nodesMap.has(rel.disciple.id)) {
        nodesMap.set(rel.disciple.id, {
          id: rel.disciple.id,
          fullName: `${rel.disciple.firstName} ${rel.disciple.lastName}`,
          role: rel.disciple.roles[0] ?? 'MEMBER',
          networkId: rel.disciple.networkId,
          networkName: rel.disciple.network?.name ?? null,
          phone: rel.disciple.phoneNumber,
          leaderCode: rel.disciple.leaderCode,
          leaderId: rel.disciple.leaderId,
        });
      }
    }

    // Build edges
    const edges: OrganigramaEdge[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.mentorId,
      target: rel.discipleId,
      type: rel.type,
    }));

    return {
      nodes: Array.from(nodesMap.values()),
      edges,
    };
  }
}
