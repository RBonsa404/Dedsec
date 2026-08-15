import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma-client';
import { EmailService } from '../email/email.service';
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto } from './dto';
import { Role } from '../common/enums';
import { PasswordValidator } from '../common/utils/password.validator';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(
    currentUserId: string,
    currentUserRole: Role,
    filters?: { role?: Role; status?: string; search?: string },
  ) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    // SECURITY ISOLATION RULE:
    // Admin: sees all users in the system.
    // Project Manager: ONLY sees users from their managed projects + users they created + themselves.
    // Team Member: ONLY sees users from projects they participate in + themselves.
    if (currentUserRole === 'PROJECT_MANAGER') {
      const managedProjects = await this.prisma.projectMember.findMany({
        where: { userId: currentUserId, isManager: true },
        select: { projectId: true },
      });
      const projectIds = managedProjects.map((p) => p.projectId);

      const teamMembers = await this.prisma.projectMember.findMany({
        where: { projectId: { in: projectIds } },
        select: { userId: true },
      });

      const createdUsers = await this.prisma.user.findMany({
        where: { createdById: currentUserId },
        select: { id: true },
      });

      const allowedUserIds = new Set<string>([
        currentUserId,
        ...teamMembers.map((m) => m.userId),
        ...createdUsers.map((u) => u.id),
      ]);

      where.id = { in: Array.from(allowedUserIds) };
    } else if (currentUserRole === 'TEAM_MEMBER') {
      const myProjects = await this.prisma.projectMember.findMany({
        where: { userId: currentUserId },
        select: { projectId: true },
      });
      const projectIds = myProjects.map((p) => p.projectId);

      const colleagues = await this.prisma.projectMember.findMany({
        where: { projectId: { in: projectIds } },
        select: { userId: true },
      });

      const allowedUserIds = new Set<string>([
        currentUserId,
        ...colleagues.map((m) => m.userId),
      ]);

      where.id = { in: Array.from(allowedUserIds) };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        phone: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        notifyEmail: true,
        notifyTaskAssigned: true,
        notifyDueSoon: true,
        notifyComments: true,
        notifyMentions: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto, creatorId: string, creatorRole: Role) {
    // PM can only create TEAM_MEMBER
    if (creatorRole === 'PROJECT_MANAGER' && dto.role !== 'TEAM_MEMBER') {
      throw new ForbiddenException('Les chefs de projet ne peuvent provisionner que des membres opérateurs');
    }

    // Only ADMINs can create ADMIN accounts
    if (dto.role === 'ADMIN' && creatorRole !== 'ADMIN') {
      throw new ForbiddenException('Seul un administrateur peut créer un autre compte administrateur');
    }

    // Check if email exists
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Cette adresse email est déjà utilisée');
    }

    // Use provided password if given, otherwise generate a temporary one
    let passwordToUse: string;
    let status: string;

    if (dto.password) {
      // Validate password strength if provided
      // Use relaxed validation for admin accounts
      if (dto.role === 'ADMIN') {
        PasswordValidator.validateOrThrowForAdmin(dto.password);
      } else {
        PasswordValidator.validateOrThrow(dto.password);
      }
      passwordToUse = dto.password;
      status = 'ACTIVE';
    } else {
      // Generate strong temporary password
      passwordToUse = this.generateTempPassword();
      status = 'PENDING_PASSWORD_CHANGE';
    }

    const passwordHash = await bcrypt.hash(passwordToUse, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        phone: dto.phone,
        passwordHash,
        status,
        createdById: creatorId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Send welcome email (non-blocking: don't fail if mail config is missing)
    try {
      await this.emailService.sendWelcomeEmail(dto.email, dto.firstName, passwordToUse);
    } catch (_) {
      // Email not configured — silently continue
    }

    // Log to audit
    await this.prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        actorId: creatorId,
        details: JSON.stringify({ userId: user.id, role: dto.role }),
      },
    });

    return { ...user, tempPassword: dto.password ? undefined : passwordToUse };
  }


  async update(id: string, dto: UpdateUserDto) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        avatarUrl: true,
      },
    });
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        theme: true,
        notifyEmail: true,
        notifyTaskAssigned: true,
        notifyDueSoon: true,
        notifyComments: true,
        notifyMentions: true,
      },
    });
  }

  async suspend(id: string, actorId: string, actorRole: Role) {
    const targetUser = await this.ensureExists(id);

    // SECURITY RULE: Nobody can suspend an Admin
    if (targetUser.role === 'ADMIN') {
      throw new ForbiddenException('Personne ne peut suspendre un compte administrateur');
    }

    // Operators cannot suspend anyone
    if (actorRole === 'TEAM_MEMBER') {
      throw new ForbiddenException('Un opérateur ne possède pas les privilèges pour suspendre un compte');
    }

    // PM cannot suspend another PM or Admin
    if (actorRole === 'PROJECT_MANAGER' && targetUser.role !== 'TEAM_MEMBER') {
      throw new ForbiddenException('Un chef de projet ne peut suspendre que les opérateurs sous sa direction');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
    await this.prisma.auditLog.create({
      data: { action: 'USER_SUSPENDED', actorId, details: JSON.stringify({ userId: id }) },
    });
    return { message: 'User suspended' };
  }

  async reactivate(id: string, actorId: string, actorRole: Role) {
    const targetUser = await this.ensureExists(id);

    if (actorRole === 'TEAM_MEMBER') {
      throw new ForbiddenException('Un opérateur ne possède pas les privilèges pour réactiver un compte');
    }

    if (actorRole === 'PROJECT_MANAGER' && targetUser.role !== 'TEAM_MEMBER') {
      throw new ForbiddenException('Un chef de projet ne peut réactiver que les opérateurs sous sa direction');
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
    await this.prisma.auditLog.create({
      data: { action: 'USER_REACTIVATED', actorId, details: JSON.stringify({ userId: id }) },
    });
    return { message: 'User reactivated' };
  }

  async delete(id: string, actorId: string, actorRole: Role) {
    const targetUser = await this.ensureExists(id);

    // SECURITY RULE 1: Personne ne doit pouvoir supprimer un admin
    if (targetUser.role === 'ADMIN') {
      throw new ForbiddenException('Action interdite : Personne ne peut supprimer un compte administrateur.');
    }

    // SECURITY RULE 2: Un opérateur ne peut pas supprimer un chef ni un admin (aucun utilisateur)
    if (actorRole === 'TEAM_MEMBER') {
      throw new ForbiddenException('Action interdite : Un opérateur ne possède pas les privilèges pour supprimer des utilisateurs.');
    }

    // SECURITY RULE 3: Un chef de projet ne peut pas supprimer un autre chef de projet ni un admin
    if (actorRole === 'PROJECT_MANAGER') {
      if (targetUser.role === 'PROJECT_MANAGER' || targetUser.role === 'ADMIN') {
        throw new ForbiddenException('Action interdite : Un chef de projet ne peut pas supprimer un autre chef de projet ni un administrateur.');
      }

      // Check if targetUser is in a project managed by this PM or created by this PM
      const managedProjects = await this.prisma.projectMember.findMany({
        where: { userId: actorId, isManager: true },
        select: { projectId: true },
      });
      const projectIds = managedProjects.map((p) => p.projectId);

      const isMemberOfManagedProject = await this.prisma.projectMember.findFirst({
        where: { projectId: { in: projectIds }, userId: id },
      });

      if (!isMemberOfManagedProject && targetUser.createdById !== actorId) {
        throw new ForbiddenException('Action interdite : Vous ne pouvez supprimer que les opérateurs de vos propres projets.');
      }
    }

    await this.prisma.user.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'USER_DELETED', actorId, details: JSON.stringify({ userId: id, email: targetUser.email }) },
    });
    return { message: 'User deleted' };
  }

  async forceResetPassword(id: string, actorId: string, actorRole: Role) {
    const targetUser = await this.ensureExists(id);

    if (actorRole === 'TEAM_MEMBER') {
      throw new ForbiddenException('Un opérateur ne peut pas réinitialiser les identifiants');
    }

    if (actorRole === 'PROJECT_MANAGER' && (targetUser.role === 'ADMIN' || targetUser.role === 'PROJECT_MANAGER')) {
      throw new ForbiddenException('Un chef de projet ne peut pas réinitialiser les identifiants d\'un autre chef ou d\'un administrateur');
    }

    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, status: 'PENDING_PASSWORD_CHANGE' },
    });

    await this.emailService.sendWelcomeEmail(targetUser.email, targetUser.firstName, tempPassword);
    await this.prisma.auditLog.create({
      data: { action: 'USER_PASSWORD_RESET', actorId, details: JSON.stringify({ userId: id }) },
    });

    return { message: 'Password reset. New credentials sent via email.' };
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private generateTempPassword(): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';

    // Ensure at least one of each required character type
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));

    // Fill the rest with random characters from all sets
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < 16; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
