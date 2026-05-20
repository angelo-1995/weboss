import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class InvitationsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findPendingByEmail(email: string) {
    return this.db.invitation.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, status: 'PENDING' },
    });
  }

  async findUserByEmail(email: string) {
    return this.db.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
    });
  }

  async create(data: {
    email: string;
    token: string;
    invitedById: string;
    groupId?: string;
    expiresAt: Date;
  }) {
    return this.db.invitation.create({
      data: {
        email: data.email,
        token: data.token,
        invitedById: data.invitedById,
        groupId: data.groupId || undefined,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return this.db.invitation.findUnique({ where: { token } });
  }

  async findById(id: string) {
    return this.db.invitation.findUnique({ where: { id } });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.db.invitation.update({
      where: { id },
      data: data as any,
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: string;
    roles: string[];
  }) {
    return this.db.user.create({
      data: data as any,
    });
  }

  async createGroupMember(data: { groupId: string; userId: string; role: string }) {
    return this.db.groupMember.create({
      data: {
        group: { connect: { id: data.groupId } },
        user: { connect: { id: data.userId } },
        role: data.role as any,
      },
    });
  }

  async findAll(invitedById: string) {
    return this.db.invitation.findMany({
      where: { invitedById },
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { id: true, name: true } },
      },
    });
  }
}
