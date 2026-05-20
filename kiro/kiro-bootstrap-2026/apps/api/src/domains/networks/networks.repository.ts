import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class NetworksRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllWithLeaders() {
    return this.db.network.findMany({
      orderBy: { name: 'asc' },
      include: {
        leaders: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.db.network.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.db.network.findUnique({ where: { code } });
  }

  async create(data: { code: string; name: string; parentNetworkId?: string | null }) {
    return this.db.network.create({
      data: {
        code: data.code,
        name: data.name,
        parentNetworkId: data.parentNetworkId || null,
      },
    });
  }

  async update(id: string, data: { name?: string; code?: string; parentNetworkId?: string | null }) {
    return this.db.network.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.parentNetworkId !== undefined && { parentNetworkId: data.parentNetworkId }),
      },
    });
  }

  async delete(id: string) {
    return this.db.network.delete({ where: { id } });
  }

  async countChildren(parentNetworkId: string) {
    return this.db.network.count({ where: { parentNetworkId } });
  }

  async findUserById(userId: string) {
    return this.db.user.findFirst({ where: { id: userId, deletedAt: null } });
  }

  async findLeader(networkId: string, userId: string) {
    return (this.db as any).networkLeader.findUnique({
      where: { networkId_userId: { networkId, userId } },
    });
  }

  async addLeader(networkId: string, userId: string, role: string) {
    return (this.db as any).networkLeader.create({
      data: { networkId, userId, role },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async removeLeader(networkId: string, userId: string) {
    return (this.db as any).networkLeader.delete({
      where: { networkId_userId: { networkId, userId } },
    });
  }

  async findLeadersByNetwork(networkId: string) {
    return (this.db as any).networkLeader.findMany({
      where: { networkId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}
