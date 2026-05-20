import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { emailTemplates } from '../../infrastructure/email/templates';

const RESET_TOKEN_TTL = 3600; // 1 hour in seconds

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly cache: CacheService,
    private readonly emailService: EmailService,
  ) {}

  async requestReset(email: string): Promise<void> {
    const user = await this.db.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      // Don't reveal if email exists — just log and return
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    const token = randomUUID();
    await this.cache.set(`pwd-reset:${token}`, { userId: user.id }, RESET_TOKEN_TTL);

    // Send password reset email
    const resetUrl = `/reset-password/${token}`;
    const html = emailTemplates.passwordReset({ resetUrl });

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Restablecer contraseña — Community OS',
      html,
      text: `Restablece tu contraseña aquí: ${resetUrl}. Este enlace expira en 1 hora.`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const cached = await this.cache.get<{ userId: string }>(`pwd-reset:${token}`);

    if (!cached) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.db.user.update({
      where: { id: cached.userId },
      data: { password: hashedPassword },
    });

    // Invalidate token
    await this.cache.del(`pwd-reset:${token}`);

    this.logger.log(`Password reset completed for user: ${cached.userId}`);
  }
}
