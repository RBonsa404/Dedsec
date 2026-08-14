import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { CreateColumnDto, UpdateColumnDto } from './dto';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string) {
    return this.prisma.board.findMany({
      where: { projectId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                labels: { include: { label: true } },
                checklists: { include: { items: true } },
                _count: { select: { comments: true, attachments: true } },
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                labels: { include: { label: true } },
                checklists: { include: { items: true } },
                _count: { select: { comments: true, attachments: true } },
              },
            },
          },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async addColumn(boardId: string, dto: CreateColumnDto) {
    const maxPos = await this.prisma.column.aggregate({
      where: { boardId },
      _max: { position: true },
    });

    return this.prisma.column.create({
      data: {
        name: dto.name,
        color: dto.color,
        boardId,
        position: (maxPos._max.position ?? -1) + 1,
      },
      include: { tasks: true },
    });
  }

  async updateColumn(columnId: string, dto: UpdateColumnDto) {
    return this.prisma.column.update({
      where: { id: columnId },
      data: dto,
    });
  }

  async deleteColumn(columnId: string) {
    // Check no tasks remain
    const taskCount = await this.prisma.task.count({ where: { columnId } });
    if (taskCount > 0) {
      // Move tasks to first column of same board
      const col = await this.prisma.column.findUnique({ where: { id: columnId } });
      if (col) {
        const firstCol = await this.prisma.column.findFirst({
          where: { boardId: col.boardId, id: { not: columnId } },
          orderBy: { position: 'asc' },
        });
        if (firstCol) {
          await this.prisma.task.updateMany({
            where: { columnId },
            data: { columnId: firstCol.id },
          });
        }
      }
    }
    await this.prisma.column.delete({ where: { id: columnId } });
    return { message: 'Column deleted' };
  }

  async reorderColumns(boardId: string, columnIds: string[]) {
    const updates = columnIds.map((id, index) =>
      this.prisma.column.update({ where: { id }, data: { position: index } }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Columns reordered' };
  }
}
