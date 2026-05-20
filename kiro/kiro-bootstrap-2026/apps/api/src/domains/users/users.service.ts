import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { AuditService } from '../audit/audit.service';
import type { CreateUserDto, UpdateUserDto, UpdateProfileDto, UsersQueryDto } from './dto/users.dto';
import type { PaginatedResponse } from '@community-os/types';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  async findMany(query: UsersQueryDto, visibleUserIds?: string[]): Promise<PaginatedResponse<unknown>> {
    const { data, total } = await this.repo.findMany(query, visibleUserIds);
    return {
      data,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        hasNextPage: query.page * query.pageSize < total,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Enrich with leader, groups, and subordinate count
    const [leader, groupMembers, subordinateCount] = await Promise.all([
      user.leaderId
        ? this.repo.findLeaderInfo(user.leaderId)
        : Promise.resolve(null),
      this.repo.findUserGroups(id),
      this.repo.countSubordinates(id),
    ]);

    return {
      ...user,
      leader,
      groups: groupMembers,
      subordinateCount,
    };
  }

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const password = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.repo.create({
      email: dto.email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      roles: dto.roles ?? ['MEMBER'],
      status: 'ACTIVE',
      ...(dto.spiritualStage && { spiritualStage: dto.spiritualStage }),
      ...(dto.campusId && { campus: { connect: { id: dto.campusId } } }),
      profile: { create: {} },
    });

    await this.audit.log({
      userId: actorId,
      action: 'user.created',
      resource: 'users',
      resourceId: user.id,
      newValues: { email: user.email, roles: user.roles },
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    // Validate ministerial role assignment
    const leadershipRoles = ['PASTOR_GENERAL', 'PASTOR_RED', 'COBERTURA', 'LIDER'];
    if (dto.ministerialRole && leadershipRoles.includes(dto.ministerialRole)) {
      // Check if user has completed Lanzamiento and is in ENVIADO stage
      const userDetails = await this.repo.findById(id) as any;
      if (!userDetails?.hasLaunch || userDetails?.spiritualStage !== 'ENVIADO') {
        throw new ForbiddenException(
          'Para asignar roles de liderazgo, el usuario debe completar Lanzamiento y estar en etapa Enviado',
        );
      }
    }

    const updated = await this.repo.update(id, {
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.status && { status: dto.status }),
      ...(dto.roles && { roles: dto.roles }),
      ...(dto.leaderCode !== undefined && { leaderCode: dto.leaderCode }),
      ...(dto.leaderId !== undefined && { leaderId: dto.leaderId }),
      ...(dto.ministerialRole !== undefined && { ministerialRole: dto.ministerialRole }),
      ...(dto.networkId !== undefined && {
        network: dto.networkId
          ? { connect: { id: dto.networkId } }
          : { disconnect: true },
      }),
      ...(dto.campusId !== undefined && {
        campus: dto.campusId
          ? { connect: { id: dto.campusId } }
          : { disconnect: true },
      }),
    });

    await this.audit.log({
      userId: actorId,
      action: 'user.updated',
      resource: 'users',
      resourceId: id,
      oldValues: { status: existing.status, roles: existing.roles },
      newValues: { status: updated.status, roles: updated.roles },
    });

    return updated;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findById(userId); // ensure exists
    return this.repo.updateProfile(userId, {
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.birthDate !== undefined && {
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.instagram !== undefined && { instagram: dto.instagram }),
      ...(dto.facebook !== undefined && { facebook: dto.facebook }),
      ...(dto.twitter !== undefined && { twitter: dto.twitter }),
      ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
      ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
    });
  }

  async remove(id: string, actorId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    // Prevent self-deletion
    if (id === actorId) throw new ForbiddenException('Cannot delete your own account');

    await this.repo.softDelete(id);

    await this.audit.log({
      userId: actorId,
      action: 'user.deleted',
      resource: 'users',
      resourceId: id,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.repo.update(userId, { avatarUrl });
  }

  async bulkAssignNetwork(userIds: string[], networkId: string) {
    const result = await this.repo.bulkUpdateNetwork(userIds, networkId);
    return { updated: result };
  }
}
