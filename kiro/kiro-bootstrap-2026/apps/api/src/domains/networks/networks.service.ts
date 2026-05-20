import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { NetworksRepository } from './networks.repository';

interface NetworkLeaderInfo {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface NetworkTreeNode {
  id: string;
  code: string;
  name: string;
  parentNetworkId: string | null;
  leaders: NetworkLeaderInfo[];
  children: NetworkTreeNode[];
}

@Injectable()
export class NetworksService {
  constructor(private readonly repository: NetworksRepository) {}

  async findAllTree(): Promise<NetworkTreeNode[]> {
    const networks = await this.repository.findAllWithLeaders();

    const map = new Map<string, NetworkTreeNode>();
    const roots: NetworkTreeNode[] = [];

    for (const n of networks) {
      map.set(n.id, {
        id: n.id,
        code: n.code,
        name: n.name,
        parentNetworkId: n.parentNetworkId,
        leaders: (n as any).leaders.map((l: any) => ({
          id: l.id,
          userId: l.user.id,
          firstName: l.user.firstName,
          lastName: l.user.lastName,
          role: l.role,
        })),
        children: [],
      });
    }

    for (const node of map.values()) {
      if (node.parentNetworkId) {
        const parent = map.get(node.parentNetworkId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async create(data: { code: string; name: string; parentNetworkId?: string }) {
    const existing = await this.repository.findByCode(data.code);
    if (existing) throw new ConflictException('Ya existe una red con este código');

    return this.repository.create({
      code: data.code,
      name: data.name,
      parentNetworkId: data.parentNetworkId || null,
    });
  }

  async update(id: string, data: { name?: string; code?: string; parentNetworkId?: string | null }) {
    const network = await this.repository.findById(id);
    if (!network) throw new NotFoundException('Red no encontrada');

    return this.repository.update(id, data);
  }

  async remove(id: string) {
    const network = await this.repository.findById(id);
    if (!network) throw new NotFoundException('Red no encontrada');

    const children = await this.repository.countChildren(id);
    if (children > 0) {
      throw new ConflictException('No se puede eliminar una red que tiene sub-redes');
    }

    return this.repository.delete(id);
  }

  async assignLeader(networkId: string, userId: string, role: string = 'PASTOR') {
    const network = await this.repository.findById(networkId);
    if (!network) throw new NotFoundException('Red no encontrada');

    const user = await this.repository.findUserById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const existing = await this.repository.findLeader(networkId, userId);
    if (existing) throw new ConflictException('Este usuario ya es líder de esta red');

    return this.repository.addLeader(networkId, userId, role);
  }

  async removeLeader(networkId: string, userId: string) {
    const record = await this.repository.findLeader(networkId, userId);
    if (!record) throw new NotFoundException('Líder no encontrado en esta red');

    return this.repository.removeLeader(networkId, userId);
  }

  async getNetworkLeaders(networkId: string) {
    const network = await this.repository.findById(networkId);
    if (!network) throw new NotFoundException('Red no encontrada');

    return this.repository.findLeadersByNetwork(networkId);
  }
}
