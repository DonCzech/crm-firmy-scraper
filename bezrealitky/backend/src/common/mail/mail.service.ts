import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST', 'smtp.resend.com'),
      port: config.get<number>('SMTP_PORT', 465),
      secure: true,
      auth: {
        user: config.get('SMTP_USER', 'resend'),
        pass: config.get('RESEND_API_KEY', ''),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const link = `${appUrl}/auth/verify-email?token=${token}`;
    await this.send(to, 'Ověření e-mailu | Bezrealitky', `
      <h2>Vítejte v Bezrealitky!</h2>
      <p>Potvrďte svůj e-mail kliknutím na odkaz:</p>
      <a href="${link}">${link}</a>
    `);
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const link = `${appUrl}/auth/reset-password?token=${token}`;
    await this.send(to, 'Resetování hesla | Bezrealitky', `
      <h2>Resetování hesla</h2>
      <p>Klikněte na odkaz pro nastavení nového hesla (platí 1 hodinu):</p>
      <a href="${link}">${link}</a>
    `);
  }

  async sendWatchdogAlert(to: string, listingTitle: string, listingUrl: string): Promise<void> {
    await this.send(to, `Nový inzerát: ${listingTitle} | Hlídací pes`, `
      <h2>Váš hlídací pes našel shodu!</h2>
      <p><strong>${listingTitle}</strong></p>
      <a href="${listingUrl}">Zobrazit inzerát</a>
    `);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM', 'noreply@bezrealitky.cz'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
