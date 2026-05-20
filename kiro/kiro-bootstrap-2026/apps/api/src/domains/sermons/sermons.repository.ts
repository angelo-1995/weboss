import { Injectable } from '@nestjs/common';
import { Prisma } from '@community-os/database';
import { DatabaseService } from '../../infrastructure/database/database.service';
import type { SermonQueryDto } from './dto/sermon-query.dto';
import type { CreateSermonDto } from './dto/create-sermon.dto';
import type { UpdateSermonDto } from './dto/update-sermon.dto';

@Injectable()
export class SermonsRepository {
  constructor(private readonly db: DatabaseService) {}

  // 3.1 — Create sermon with status logic
  async create(data: CreateSermonDto & { networkId: string; createdById: string }) {
    const now = new Date();
    let status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' = 'PUBLISHED';
    let publishedAt: Date | null = now;

    if (data.publishAt) {
      const publishAtDate = new Date(data.publishAt);
      if (publishAtDate > now) {
        status = 'SCHEDULED';
        publishedAt = null;
      }
      // If publishAt is in the past → PUBLISHED with publishedAt = now
    }

    return this.db.sermon.create({
      data: {
        title: data.title,
        description: data.description,
        sermonDate: new Date(data.sermonDate),
        videoUrl: data.videoUrl,
        externalLink: data.externalLink,
        publishAt: data.publishAt ? new Date(data.publishAt) : null,
        status,
        publishedAt,
        network: { connect: { id: data.networkId } },
        createdBy: { connect: { id: data.createdById } },
      },
      include: {
        files: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // 3.2 — Find by ID with files, view count, createdBy; exclude soft-deleted
  async findById(id: string) {
    return this.db.sermon.findFirst({
      where: { id, deletedAt: null },
      include: {
        files: true,
        _count: { select: { views: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // 3.3 — Cursor-based pagination with filters
  async findByNetwork(networkId: string, options: SermonQueryDto) {
    const { cursor, limit = 20, search, dateFrom, dateTo, status } = options;

    const where: Prisma.SermonWhereInput = {
      networkId,
      deletedAt: null,
      ...(status ? { status } : { status: 'PUBLISHED' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(dateFrom || dateTo
        ? {
            sermonDate: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.sermon.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { sermonDate: 'desc' },
        include: {
          files: true,
          _count: { select: { views: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.db.sermon.count({ where }),
    ]);

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { items: data, nextCursor, total };
  }

  // 3.4 — Partial update with old values capture
  async update(id: string, data: UpdateSermonDto) {
    // Fetch current values for audit
    const oldValues = await this.db.sermon.findUnique({ where: { id } });

    const updated = await this.db.sermon.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sermonDate !== undefined && { sermonDate: new Date(data.sermonDate) }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.externalLink !== undefined && { externalLink: data.externalLink }),
        ...(data.publishAt !== undefined && { publishAt: data.publishAt ? new Date(data.publishAt) : null }),
      },
      include: {
        files: true,
        _count: { select: { views: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return { oldValues, updated };
  }

  // 3.5 — Soft delete
  async softDelete(id: string) {
    return this.db.sermon.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Scheduled publishing helpers
  async findScheduledReady() {
    return this.db.sermon.findMany({
      where: {
        status: 'SCHEDULED',
        publishAt: { lte: new Date() },
        deletedAt: null,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.sermon.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });
  }

  // View tracking
  async createView(sermonId: string, userId: string) {
    return this.db.sermonView.upsert({
      where: { sermonId_userId: { sermonId, userId } },
      create: { sermonId, userId },
      update: { viewedAt: new Date() },
    });
  }

  async getViewsBySermon(sermonId: string) {
    return this.db.sermonView.findMany({
      where: { sermonId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { viewedAt: 'desc' },
    });
  }

  async getUnviewedCount(networkId: string, userId: string) {
    const count = await this.db.sermon.count({
      where: {
        networkId,
        status: 'PUBLISHED',
        deletedAt: null,
        views: { none: { userId } },
      },
    });
    return count;
  }

  async getAdminStats(networkId: string) {
    const [totalPublished, totalViews, pendingScheduled] = await Promise.all([
      this.db.sermon.count({
        where: { networkId, status: 'PUBLISHED', deletedAt: null },
      }),
      this.db.sermonView.count({
        where: { sermon: { networkId, deletedAt: null } },
      }),
      this.db.sermon.count({
        where: { networkId, status: 'SCHEDULED', deletedAt: null },
      }),
    ]);

    return { totalPublished, totalViews, pendingScheduled };
  }

  // File management
  async createFile(data: {
    sermonId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) {
    return this.db.sermonFile.create({ data });
  }

  async findFileById(fileId: string) {
    return this.db.sermonFile.findUnique({ where: { id: fileId } });
  }

  async deleteFile(fileId: string) {
    return this.db.sermonFile.delete({ where: { id: fileId } });
  }

  async countFilesBySermon(sermonId: string) {
    return this.db.sermonFile.count({ where: { sermonId } });
  }

  async updateCoverImage(sermonId: string, coverImageUrl: string) {
    return this.db.sermon.update({
      where: { id: sermonId },
      data: { coverImageUrl },
    });
  }
}
