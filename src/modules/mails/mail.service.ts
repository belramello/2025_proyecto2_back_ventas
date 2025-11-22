import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, nombre: string, resetUrl: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperación de Contraseña - Gestión Ventas',
      template: './reset-password',
      context: {
        resetUrl,
        nombre,
      },
    });
  }
}
