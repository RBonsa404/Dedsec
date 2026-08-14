import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(title: string, content: string) {
    return this.prisma.announcement.create({
      data: { title, content },
    });
  }

  async update(id: string, data: { title?: string; content?: string; isActive?: boolean }) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }
}
