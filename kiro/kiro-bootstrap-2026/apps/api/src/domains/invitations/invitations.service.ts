import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { InvitationsRepository } from './invitations.repository';
import { EmailService } from '../../infrastructure/email/email.service';
import { emailTemplates } from '../../infrastructure/email/templates';

const INVITATION_TTL_HOURS = 72;

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly repository: InvitationsRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(email: string, invitedById: string, groupId?: string) {
    // Check if there's already a pending invitation for this email
    const existing = await this.repository.findPendingByEmail(email);

    if (existing) {
      throw new BadRequestException('Ya existe una invitación pendiente para este email');
    }

    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con este email');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);

    const invitation = await this.repository.create({
      email: email.toLowerCase().trim(),
      token,
      invitedById,
      groupId: groupId || undefined,
      expiresAt,
    });

    // Send invitation email
    const activationUrl = `/activate/${token}`;
    const html = emailTemplates.invitation({ activationUrl });

    await this.emailService.sendEmail({
      to: email,
      subject: 'Has sido invitado a Community OS',
      html,
      text: `Has sido invitado a Community OS. Activa tu cuenta aquí: ${activationUrl}`,
    });

    return invitation;
  }

  async activate(token: string, password: string, firstName?: string, lastName?: string) {
    const invitation = await this.repository.findByToken(token);

    if (!invitation) {
      throw new BadRequestException('Invitación no encontrada');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Esta invitación ya fue utilizada');
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await this.repository.update(invitation.id, { status: 'EXPIRED' });
      throw new BadRequestException('Esta invitación ha expirado');
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const user = await this.repository.createUser({
      email: invitation.email,
      password: hashedPassword,
      firstName: firstName || invitation.email.split('@')[0],
      lastName: lastName || '',
      status: 'ACTIVE',
      roles: ['MEMBER'],
    });

    // If groupId, add user to group
    if (invitation.groupId) {
      await this.repository.createGroupMember({
        groupId: invitation.groupId,
        userId: user.id,
        role: 'MEMBER',
      });
    }

    // Mark invitation as accepted
    await this.repository.update(invitation.id, { status: 'ACCEPTED', acceptedAt: new Date() });

    this.logger.log(`[INVITATION ACCEPTED] User created: ${user.email}`);

    return { message: 'Cuenta activada correctamente' };
  }

  async resend(invitationId: string, actorId: string) {
    const invitation = await this.repository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.invitedById !== actorId) {
      throw new BadRequestException('No tienes permiso para reenviar esta invitación');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new BadRequestException('Esta invitación ya fue aceptada');
    }

    const newToken = randomUUID();
    const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);

    const updated = await this.repository.update(invitationId, {
      token: newToken,
      expiresAt,
      status: 'PENDING',
    });

    // Resend invitation email
    const activationUrl = `/activate/${newToken}`;
    const html = emailTemplates.invitation({ activationUrl });

    await this.emailService.sendEmail({
      to: invitation.email,
      subject: 'Has sido invitado a Community OS',
      html,
      text: `Has sido invitado a Community OS. Activa tu cuenta aquí: ${activationUrl}`,
    });

    return updated;
  }

  async findAll(actorId: string) {
    return this.repository.findAll(actorId);
  }

  async findByToken(token: string) {
    const invitation = await this.repository.findByToken(token);

    if (!invitation) return null;

    if (invitation.status !== 'PENDING') return null;

    if (new Date() > invitation.expiresAt) {
      await this.repository.update(invitation.id, { status: 'EXPIRED' });
      return null;
    }

    return invitation;
  }
}
