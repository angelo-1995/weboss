import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES } from '../queue.constants';
import { EmailService } from '../../email/email.service';
import { emailTemplates } from '../../email/templates';

/**
 * Processes notification jobs (email, push, in-app).
 * Sends emails via Nodemailer (Maildev in dev, SES/SendGrid in production).
 */
@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('welcome-email')
  async handleWelcomeEmail(job: { data: Record<string, unknown> }): Promise<void> {
    const { email, firstName } = job.data as { email: string; firstName: string };

    const html = emailTemplates.welcome({
      firstName: firstName || 'Usuario',
      loginUrl: '/login',
    });

    await this.emailService.sendEmail({
      to: email,
      subject: '¡Bienvenido a Community OS!',
      html,
      text: `¡Bienvenido, ${firstName}! Tu cuenta ha sido creada. Inicia sesión en /login`,
    });
  }

  @Process('invitation-email')
  async handleInvitationEmail(job: { data: Record<string, unknown> }): Promise<void> {
    const { email, token } = job.data as { email: string; invitedBy: string; groupName: string; token: string };

    const activationUrl = `/activate/${token}`;
    const html = emailTemplates.invitation({ activationUrl });

    await this.emailService.sendEmail({
      to: email,
      subject: 'Has sido invitado a Community OS',
      html,
      text: `Has sido invitado a Community OS. Activa tu cuenta aquí: ${activationUrl}`,
    });
  }

  @Process('generic')
  async handleGenericNotification(job: { data: Record<string, unknown> }): Promise<void> {
    const { type, recipient, message } = job.data;
    this.logger.log(`[Notification] (${type}) to ${recipient}: ${message}`);
  }
}
