import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(@Optional() private readonly config?: ConfigService) {
    try {
      const host = this.config?.get<string>('SMTP_HOST') || 'localhost';
      const port = Number(this.config?.get<string>('SMTP_PORT')) || 1025;
      const secure = this.config?.get<string>('SMTP_SECURE') === 'true';
      const user = this.config?.get<string>('SMTP_USER');
      const pass = this.config?.get<string>('SMTP_PASS');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        ...(user && pass ? { auth: { user, pass } } : {}),
      });

      this.logger.log(`Email transport configured: ${host}:${port} (secure: ${secure})`);
    } catch (error) {
      this.logger.warn('Email transport not configured — emails will be logged only');
      this.transporter = null;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const from = this.config?.get<string>('SMTP_FROM') || 'Community OS <noreply@communityos.app>';

    if (!this.transporter) {
      this.logger.log(`[Email Log] To: ${options.to} | Subject: "${options.subject}"`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.text ? { text: options.text } : {}),
      });

      this.logger.log(`Email sent to ${options.to} — Subject: "${options.subject}"`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw — email failure should not break the app flow
    }
  }
}
