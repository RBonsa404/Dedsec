import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    // Check if SMTP is properly configured
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    this.logger.log(`═══════════════════════════════════════`);
    this.logger.log(`EMAIL SERVICE INITIALIZATION`);
    this.logger.log(`═══════════════════════════════════════`);
    this.logger.log(`SMTP_HOST: "${smtpHost}"`);
    this.logger.log(`SMTP_USER: "${smtpUser}"`);
    this.logger.log(`SMTP_PASS configured: ${!!smtpPass}`);
    this.logger.log(`SMTP_PORT: "${process.env.SMTP_PORT || '587'}"`);
    this.logger.log(`SMTP_SECURE: "${process.env.SMTP_SECURE || 'false'}"`);
    this.logger.log(`═══════════════════════════════════════`);

    if (smtpHost && smtpUser && smtpPass && 
        smtpHost !== "your-mailtrap-user" && 
        smtpUser !== "your-mailtrap-user" &&
        smtpPass !== "your-mailtrap-pass") {
      try {
        this.logger.log(`🔄 Attempting to configure SMTP transporter...`);
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        
        this.logger.log(`🔄 Verifying SMTP connection...`);
        // Verify the connection
        await this.transporter.verify();
        this.logger.log('✅ Email transporter configured and verified with SMTP');
        this.logger.log('✅ Real emails will be sent');
      } catch (error) {
        this.logger.error('❌ SMTP CONNECTION FAILED');
        this.logger.error(`❌ Error: ${error.message}`);
        this.logger.error(`❌ Error code: ${error.code}`);
        this.logger.error('❌ Common Gmail issues: wrong app password, 2FA not enabled, or less secure apps blocked');
        this.logger.error('❌ Falling back to LOG ONLY mode');
        this.transporter = null;
      }
    } else {
      this.logger.warn('⚠️ SMTP not properly configured or using placeholder values.');
      this.logger.warn('⚠️ Emails will be LOGGED ONLY (not actually sent).');
      this.logger.warn('⚠️ To enable real email sending with Gmail:');
      this.logger.warn('⚠️ 1. Enable 2FA on your Google Account');
      this.logger.warn('⚠️ 2. Generate an App Password (not your regular password)');
      this.logger.warn('⚠️ 3. Set SMTP_PASS in Render with the App Password');
      this.logger.warn('⚠️ See EMAIL_CONFIG.md for detailed instructions');
      this.transporter = null;
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from = process.env.EMAIL_FROM || 'noreply@dedsec.io';

    if (this.transporter) {
      try {
        this.logger.log(`📧 Attempting to send REAL email to ${options.to}...`);
        const info = await this.transporter.sendMail({
          from: `"DEDSEC Platform" <${from}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`📧 Preview URL: ${previewUrl}`);
        }
        this.logger.log(`✅ REAL email successfully sent to ${options.to}: ${options.subject}`);
        this.logger.log(`Message ID: ${info.messageId}`);
      } catch (error) {
        this.logger.error(`❌ Failed to send REAL email to ${options.to}`, error);
        this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      }
    } else {
      // Fallback: log the email only
      this.logger.warn(`⚠️ ⚠️ ⚠️ EMAIL NOT CONFIGURED - EMAIL LOGGED ONLY ⚠️ ⚠️ ⚠️`);
      this.logger.warn(`⚠️ Email would be sent to: ${options.to}`);
      this.logger.warn(`⚠️ Subject: ${options.subject}`);
      this.logger.warn(`⚠️ To enable real emails, configure SMTP with real credentials`);
      this.logger.warn(`⚠️ See EMAIL_CONFIG.md for instructions`);
      this.logger.log(`═══ EMAIL CONTENT (LOGGED ONLY) ═══`);
      this.logger.log(`To: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`Body: ${options.html.substring(0, 300)}...`);
      this.logger.log(`═══════════════════════════════════════`);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string, tempPassword: string): Promise<void> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    await this.sendMail({
      to: email,
      subject: '🔒 Bienvenue sur DEDSEC — Vos identifiants de connexion',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Votre compte a été créé sur la plateforme <strong>DEDSEC</strong>.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #00ff88; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email :</strong> <code style="color: #00d4ff;">${email}</code></p>
            <p style="margin: 5px 0;"><strong>Mot de passe temporaire :</strong> <code style="color: #ff3366;">${tempPassword}</code></p>
          </div>
          <p>⚠️ Vous devrez changer votre mot de passe lors de votre première connexion.</p>
          <a href="${loginUrl}" style="display: inline-block; background: #00ff88; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Se connecter à DEDSEC
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await this.sendMail({
      to: email,
      subject: '🔐 DEDSEC — Réinitialisation de mot de passe',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #00d4ff; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Réinitialiser mon mot de passe
          </a>
          <p style="margin-top: 20px; color: #8888a0;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendTaskAssignedEmail(email: string, firstName: string, taskTitle: string, projectName: string, assignerName: string): Promise<void> {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-tasks`;
    await this.sendMail({
      to: email,
      subject: '📋 DEDSEC — Nouvelle tâche assignée',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p><strong>${assignerName}</strong> vous a assigné une nouvelle tâche dans le projet <strong>${projectName}</strong>.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #00d4ff; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Tâche :</strong> ${taskTitle}</p>
            <p style="margin: 5px 0;"><strong>Projet :</strong> ${projectName}</p>
          </div>
          <a href="${taskUrl}" style="display: inline-block; background: #00d4ff; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir mes tâches
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendTaskUpdatedEmail(email: string, firstName: string, taskTitle: string, updateType: string, updaterName: string): Promise<void> {
    const taskUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-tasks`;
    await this.sendMail({
      to: email,
      subject: '📝 DEDSEC — Mise à jour de tâche',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p><strong>${updaterName}</strong> a mis à jour la tâche <strong>${taskTitle}</strong>.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #ffaa00; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Type de mise à jour :</strong> ${updateType}</p>
            <p style="margin: 5px 0;"><strong>Tâche :</strong> ${taskTitle}</p>
          </div>
          <a href="${taskUrl}" style="display: inline-block; background: #ffaa00; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir les détails
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendProjectInvitedEmail(email: string, firstName: string, projectName: string, inviterName: string): Promise<void> {
    const projectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects`;
    await this.sendMail({
      to: email,
      subject: '🚀 DEDSEC — Invitation à un projet',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p><strong>${inviterName}</strong> vous a invité à rejoindre le projet <strong>${projectName}</strong>.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #00ff88; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Projet :</strong> ${projectName}</p>
            <p style="margin: 5px 0;"><strong>Invité par :</strong> ${inviterName}</p>
          </div>
          <a href="${projectUrl}" style="display: inline-block; background: #00ff88; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir le projet
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendAbsenceRequestEmail(email: string, firstName: string, requesterName: string, startDate: string, endDate: string, reason: string): Promise<void> {
    const absencesUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/absences`;
    await this.sendMail({
      to: email,
      subject: '📅 DEDSEC — Demande de congé',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p><strong>${requesterName}</strong> a soumis une demande de congé qui nécessite votre approbation.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #ffaa00; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Demandeur :</strong> ${requesterName}</p>
            <p style="margin: 5px 0;"><strong>Du :</strong> ${startDate}</p>
            <p style="margin: 5px 0;"><strong>Au :</strong> ${endDate}</p>
            <p style="margin: 5px 0;"><strong>Raison :</strong> ${reason}</p>
          </div>
          <a href="${absencesUrl}" style="display: inline-block; background: #ffaa00; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Gérer les demandes
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendAbsenceApprovedEmail(email: string, firstName: string, startDate: string, endDate: string): Promise<void> {
    const absencesUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/absences`;
    await this.sendMail({
      to: email,
      subject: '✅ DEDSEC — Congé approuvé',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Votre demande de congé a été approuvée.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #00ff88; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Du :</strong> ${startDate}</p>
            <p style="margin: 5px 0;"><strong>Au :</strong> ${endDate}</p>
          </div>
          <a href="${absencesUrl}" style="display: inline-block; background: #00ff88; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir mes congés
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }

  async sendAnnouncementEmail(email: string, firstName: string, title: string, content: string, authorName: string): Promise<void> {
    const announcementsUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/announcements`;
    await this.sendMail({
      to: email,
      subject: `📢 DEDSEC — ${title}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border: 1px solid #2a2a3e; border-radius: 8px;">
          <h1 style="color: #00ff88; font-family: monospace;">[ DEDSEC ]</h1>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p><strong>${authorName}</strong> a publié une nouvelle annonce.</p>
          <div style="background: #12121a; padding: 20px; border-radius: 6px; border-left: 3px solid #ff00ff; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #ff00ff;">${title}</h3>
            <p style="margin: 0;">${content}</p>
          </div>
          <a href="${announcementsUrl}" style="display: inline-block; background: #ff00ff; color: #0a0a0f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Voir toutes les annonces
          </a>
          <hr style="border-color: #2a2a3e; margin: 30px 0;" />
          <p style="color: #555566; font-size: 12px;">DEDSEC — Plateforme de gestion de projet collaborative</p>
        </div>
      `,
    });
  }
}
