import { BadRequestException } from '@nestjs/common';

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Le mot de passe est requis');
      return { valid: false, errors };
    }

    // Length validation
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${this.MIN_LENGTH} caractères`);
    }
    if (password.length > this.MAX_LENGTH) {
      errors.push(`Le mot de passe ne peut pas dépasser ${this.MAX_LENGTH} caractères`);
    }

    // Only check for extremely common weak passwords
    const extremelyCommonPasswords = ['password', '123456', '12345678'];
    if (extremelyCommonPasswords.some(common => password.toLowerCase() === common)) {
      errors.push('Ce mot de passe est trop courant');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateOrThrow(password: string): void {
    const validation = this.validate(password);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Mot de passe invalide',
        errors: validation.errors
      });
    }
  }

  static getPasswordRequirements(): string[] {
    return [
      `Au moins ${this.MIN_LENGTH} caractères`,
      'Éviter les mots de passe extrêmement courants (password, 123456, etc.)'
    ];
  }
}