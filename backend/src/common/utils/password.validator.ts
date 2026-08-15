import { BadRequestException } from '@nestjs/common';

export class PasswordValidator {
  private static readonly MIN_LENGTH = 12;
  private static readonly MAX_LENGTH = 128;
  private static readonly REQUIRE_UPPERCASE = true;
  private static readonly REQUIRE_LOWERCASE = true;
  private static readonly REQUIRE_NUMBERS = true;
  private static readonly REQUIRE_SPECIAL_CHARS = true;
  private static readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Admin relaxed requirements
  private static readonly ADMIN_MIN_LENGTH = 8;
  private static readonly ADMIN_REQUIRE_UPPERCASE = false;
  private static readonly ADMIN_REQUIRE_LOWERCASE = false;
  private static readonly ADMIN_REQUIRE_NUMBERS = false;
  private static readonly ADMIN_REQUIRE_SPECIAL_CHARS = false;

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

    // Uppercase validation
    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    // Lowercase validation
    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    // Numbers validation
    if (this.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    // Special characters validation
    if (this.REQUIRE_SPECIAL_CHARS) {
      const hasSpecialChar = this.SPECIAL_CHARS.split('').some(char => password.includes(char));
      if (!hasSpecialChar) {
        errors.push(`Le mot de passe doit contenir au moins un caractère spécial (${this.SPECIAL_CHARS})`);
      }
    }

    // Common weak passwords
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'monkey', 'letmein', 'dragon', '111111', 'baseball',
      'iloveyou', 'trustno1', 'sunshine', 'master', 'admin',
      'welcome', 'shadow', 'ashley', 'football', 'jesus',
      'michael', 'ninja', 'mustang', 'password1'
    ];

    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Le mot de passe contient un mot de passe commun trop faible');
    }

    // Sequential characters
    if (this.hasSequentialChars(password)) {
      errors.push('Le mot de passe ne doit pas contenir de séquences de caractères consécutifs');
    }

    // Repeated characters
    if (this.hasRepeatedChars(password)) {
      errors.push('Le mot de passe ne doit pas contenir trop de caractères répétés');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateForAdmin(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Le mot de passe est requis');
      return { valid: false, errors };
    }

    // Length validation (relaxed for admin)
    if (password.length < this.ADMIN_MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${this.ADMIN_MIN_LENGTH} caractères`);
    }
    if (password.length > this.MAX_LENGTH) {
      errors.push(`Le mot de passe ne peut pas dépasser ${this.MAX_LENGTH} caractères`);
    }

    // Uppercase validation (optional for admin)
    if (this.ADMIN_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    // Lowercase validation (optional for admin)
    if (this.ADMIN_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    // Numbers validation (optional for admin)
    if (this.ADMIN_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    // Special characters validation (optional for admin)
    if (this.ADMIN_REQUIRE_SPECIAL_CHARS) {
      const hasSpecialChar = this.SPECIAL_CHARS.split('').some(char => password.includes(char));
      if (!hasSpecialChar) {
        errors.push(`Le mot de passe doit contenir au moins un caractère spécial (${this.SPECIAL_CHARS})`);
      }
    }

    // Only check for extremely common weak passwords for admin
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

  static validateOrThrowForAdmin(password: string): void {
    const validation = this.validateForAdmin(password);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Mot de passe invalide',
        errors: validation.errors
      });
    }
  }

  private static hasSequentialChars(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    for (let i = 0; i < lowerPassword.length - 2; i++) {
      const charCode = lowerPassword.charCodeAt(i);
      const nextCharCode = lowerPassword.charCodeAt(i + 1);
      const nextNextCharCode = lowerPassword.charCodeAt(i + 2);

      if (charCode + 1 === nextCharCode && nextCharCode + 1 === nextNextCharCode) {
        return true;
      }
    }
    return false;
  }

  private static hasRepeatedChars(password: string): boolean {
    let maxRepeat = 0;
    let currentRepeat = 1;

    for (let i = 1; i < password.length; i++) {
      if (password[i] === password[i - 1]) {
        currentRepeat++;
      } else {
        maxRepeat = Math.max(maxRepeat, currentRepeat);
        currentRepeat = 1;
      }
    }
    maxRepeat = Math.max(maxRepeat, currentRepeat);

    return maxRepeat > 3;
  }

  static getPasswordRequirements(): string[] {
    return [
      `Au moins ${this.MIN_LENGTH} caractères`,
      'Au moins une majuscule',
      'Au moins une minuscule',
      'Au moins un chiffre',
      `Au moins un caractère spécial (${this.SPECIAL_CHARS})`,
      'Pas de mots de passe communs',
      'Pas de séquences de caractères consécutifs',
      'Pas de caractères répétés plus de 3 fois'
    ];
  }

  static getAdminPasswordRequirements(): string[] {
    return [
      `Au moins ${this.ADMIN_MIN_LENGTH} caractères`,
      'Éviter les mots de passe extrêmement courants (password, 123456, etc.)'
    ];
  }
}