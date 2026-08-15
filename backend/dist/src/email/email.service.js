"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor() {
        this.logger = new common_1.Logger('EmailService');
        this.transporter = null;
        this.initTransporter();
    }
    async initTransporter() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.logger.log('Email transporter configured with SMTP');
        }
        else {
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                this.logger.log(`Email dev mode: using Ethereal (${testAccount.user})`);
            }
            catch {
                this.logger.warn('Email: Could not create Ethereal account, emails will be logged only');
            }
        }
    }
    async sendMail(options) {
        const from = process.env.EMAIL_FROM || 'noreply@dedsec.io';
        if (this.transporter) {
            try {
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
                this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
            }
            catch (error) {
                this.logger.error(`Failed to send email to ${options.to}`, error);
            }
        }
        else {
            this.logger.log(`═══ EMAIL (simulated) ═══`);
            this.logger.log(`To: ${options.to}`);
            this.logger.log(`Subject: ${options.subject}`);
            this.logger.log(`Body: ${options.html.substring(0, 200)}...`);
            this.logger.log(`═══════════════════════`);
        }
    }
    async sendWelcomeEmail(email, firstName, tempPassword) {
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
    async sendPasswordResetEmail(email, firstName, resetToken) {
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
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map