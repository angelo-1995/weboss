import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { SermonsRepository } from './sermons.repository';
import {
  saveFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENTS,
} from '../../common/utils/file-upload.util';
import type { CreateSermonDto } from './dto/create-sermon.dto';
import type { UpdateSermonDto } from './dto/update-sermon.dto';
import type { SermonQueryDto } from './dto/sermon-query.dto';
import type { MultipartFile } from '@fastify/multipart';

@Injectable()
export class SermonsService {
  private readonly logger = new Logger(SermonsService.name);

  constructor(
    private readonly repo: SermonsRepository,
    private readonly events: EventEmitter2,
    private readonly db: DatabaseService,
  ) {}

  // 3.6 — Create sermon
  async create(dto: CreateSermonDto, userId: string, files?: unknown[]) {
    // Get user's network leader record to find their networkId
    const leaderRecord = await this.db.networkLeader.findFirst({
      where: { userId, role: 'PASTOR' },
      select: { networkId: true },
    });

    if (!leaderRecord) {
      throw new ForbiddenException('Only network pastors can create sermons');
    }

    const sermon = await this.repo.create({
      ...dto,
      networkId: leaderRecord.networkId,
      createdById: userId,
    });

    // Emit audit event
    this.events.emit('sermon.created', {
      sermonId: sermon.id,
      networkId: leaderRecord.networkId,
      userId,
    });

    // If published immediately, trigger notification
    if (sermon.status === 'PUBLISHED') {
      this.events.emit('sermon.published', {
        sermonId: sermon.id,
        networkId: leaderRecord.networkId,
      });
    }

    this.logger.log(`Sermon created: ${sermon.id} (status: ${sermon.status})`);
    return sermon;
  }

  // 3.7 — Update sermon
  async update(id: string, dto: UpdateSermonDto, userId: string) {
    const sermon = await this.repo.findById(id);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    // Validate user is the creator or has ADMIN/SUPER_ADMIN role
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
    const isCreator = sermon.createdById === userId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You can only edit your own sermons');
    }

    // Validate network ownership (non-admin must belong to same network)
    if (!isAdmin && user.networkId !== sermon.networkId) {
      throw new ForbiddenException('Sermon belongs to a different network');
    }

    const { oldValues, updated } = await this.repo.update(id, dto);

    // Emit audit event
    this.events.emit('sermon.updated', {
      sermonId: id,
      networkId: sermon.networkId,
      userId,
      oldValues,
    });

    this.logger.log(`Sermon updated: ${id}`);
    return updated;
  }

  // 3.8 — Soft delete sermon
  async softDelete(id: string, userId: string) {
    const sermon = await this.repo.findById(id);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    // Validate user is the creator or has ADMIN/SUPER_ADMIN role
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
    const isCreator = sermon.createdById === userId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You can only delete your own sermons');
    }

    if (!isAdmin && user.networkId !== sermon.networkId) {
      throw new ForbiddenException('Sermon belongs to a different network');
    }

    await this.repo.softDelete(id);

    // Emit audit event
    this.events.emit('sermon.deleted', {
      sermonId: id,
      networkId: sermon.networkId,
      userId,
    });

    this.logger.log(`Sermon soft-deleted: ${id}`);
  }

  // 3.9 — Find by ID with access validation and view recording
  async findById(id: string, userId: string) {
    const sermon = await this.repo.findById(id);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    // Validate user has access
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');

    if (!isAdmin && user.networkId !== sermon.networkId) {
      throw new ForbiddenException('You do not have access to this sermon');
    }

    // Record view
    await this.recordView(id, userId);

    return sermon;
  }

  // 3.10 — Find by network with user scoping
  async findByNetwork(userId: string, query: SermonQueryDto) {
    // Determine the user's networkId
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');

    // If admin, they can pass a networkId filter; otherwise use their own
    let networkId: string;
    if (isAdmin) {
      // Admins can see all — use user's networkId if they have one, otherwise get first available
      networkId = user.networkId ?? '';
      if (!networkId) {
        // Admin without a network — return empty
        return { items: [], nextCursor: null, total: 0 };
      }
    } else {
      if (!user.networkId) {
        return { items: [], nextCursor: null, total: 0 };
      }
      networkId = user.networkId;
    }

    return this.repo.findByNetwork(networkId, query);
  }

  // Admin stats
  async getAdminStats(userId: string) {
    const leaderRecord = await this.db.networkLeader.findFirst({
      where: { userId, role: 'PASTOR' },
      select: { networkId: true },
    });

    if (!leaderRecord) {
      // Check if admin
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { roles: true, networkId: true },
      });
      if (!user) throw new NotFoundException('User not found');

      const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
      if (!isAdmin || !user.networkId) {
        throw new ForbiddenException('Only network pastors or admins can view stats');
      }

      const stats = await this.repo.getAdminStats(user.networkId);
      const avgViewsPerSermon =
        stats.totalPublished > 0
          ? Math.round(stats.totalViews / stats.totalPublished)
          : 0;
      return { ...stats, avgViewsPerSermon };
    }

    const stats = await this.repo.getAdminStats(leaderRecord.networkId);
    const avgViewsPerSermon =
      stats.totalPublished > 0
        ? Math.round(stats.totalViews / stats.totalPublished)
        : 0;
    return { ...stats, avgViewsPerSermon };
  }

  // View analytics
  async getViewAnalytics(sermonId: string) {
    const sermon = await this.repo.findById(sermonId);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    const views = await this.repo.getViewsBySermon(sermonId);

    // Get all active members in the network
    const allMembers = await this.db.user.findMany({
      where: { networkId: sermon.networkId, status: 'ACTIVE', deletedAt: null },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const viewedUserIds = new Set(views.map((v) => v.userId));
    const viewedMembers = allMembers.filter((m) => viewedUserIds.has(m.id));
    const notViewedMembers = allMembers.filter((m) => !viewedUserIds.has(m.id));

    return {
      totalViews: views.length,
      totalMembers: allMembers.length,
      viewedMembers,
      notViewedMembers,
    };
  }

  // Record view (upsert)
  async recordView(sermonId: string, userId: string) {
    try {
      await this.repo.createView(sermonId, userId);
    } catch {
      // Silently handle — view recording should not break the flow
      this.logger.warn(`Failed to record view for sermon ${sermonId}, user ${userId}`);
    }
  }

  // --- File Upload Methods ---

  private getUploadsBasePath(): string {
    return join(process.cwd(), 'uploads', 'sermons');
  }

  /**
   * Upload a cover image for a sermon.
   * Validates: JPEG/PNG/WebP, max 5 MB.
   */
  async uploadCoverImage(sermonId: string, file: MultipartFile, userId: string) {
    const sermon = await this.repo.findById(sermonId);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    await this.validateSermonOwnership(sermon, userId);

    const destDir = join(this.getUploadsBasePath(), sermonId);
    const result = await saveFile(file, destDir, {
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      maxSize: MAX_IMAGE_SIZE,
    });

    const coverImageUrl = `uploads/sermons/${sermonId}/${result.fileName}`;
    await this.repo.updateCoverImage(sermonId, coverImageUrl);

    this.logger.log(`Cover image uploaded for sermon ${sermonId}`);
    return { coverImageUrl, ...result };
  }

  /**
   * Upload file attachments for a sermon.
   * Validates: PDF/DOCX/TXT, max 20 MB each, max 10 per sermon.
   */
  async uploadFiles(sermonId: string, files: MultipartFile[], userId: string) {
    const sermon = await this.repo.findById(sermonId);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    await this.validateSermonOwnership(sermon, userId);

    // Check total count
    const existingCount = await this.repo.countFilesBySermon(sermonId);
    if (existingCount + files.length > MAX_ATTACHMENTS) {
      throw new BadRequestException(
        `Se permite un máximo de ${MAX_ATTACHMENTS} archivos adjuntos por predicación`,
      );
    }

    const destDir = join(this.getUploadsBasePath(), sermonId);
    const savedFiles = [];

    for (const file of files) {
      const result = await saveFile(file, destDir, {
        allowedMimeTypes: ALLOWED_ATTACHMENT_TYPES,
        maxSize: MAX_ATTACHMENT_SIZE,
      });

      const fileUrl = `uploads/sermons/${sermonId}/${result.fileName}`;
      const record = await this.repo.createFile({
        sermonId,
        fileName: result.fileName,
        fileUrl,
        fileSize: result.fileSize,
        mimeType: result.mimeType,
      });

      savedFiles.push(record);
    }

    this.logger.log(`${savedFiles.length} file(s) uploaded for sermon ${sermonId}`);
    return savedFiles;
  }

  /**
   * Delete a file attachment from a sermon.
   */
  async deleteFile(sermonId: string, fileId: string, userId: string) {
    const sermon = await this.repo.findById(sermonId);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    await this.validateSermonOwnership(sermon, userId);

    const file = await this.repo.findFileById(fileId);
    if (!file || file.sermonId !== sermonId) {
      throw new NotFoundException('File not found');
    }

    // Delete from disk
    const filePath = join(process.cwd(), file.fileUrl);
    await unlink(filePath).catch(() => {
      this.logger.warn(`Could not delete file from disk: ${filePath}`);
    });

    // Delete from database
    await this.repo.deleteFile(fileId);

    this.logger.log(`File ${fileId} deleted from sermon ${sermonId}`);
  }

  /**
   * Validate that a user can access a file (network member or admin).
   */
  async validateFileAccess(sermonId: string, userId: string): Promise<boolean> {
    const sermon = await this.repo.findById(sermonId);
    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
    if (isAdmin) return true;

    if (user.networkId !== sermon.networkId) {
      throw new ForbiddenException('You do not have access to this file');
    }

    return true;
  }

  /**
   * Validates that the user owns the sermon (creator or admin).
   */
  private async validateSermonOwnership(
    sermon: { createdById: string; networkId: string },
    userId: string,
  ) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, roles: true, networkId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
    const isCreator = sermon.createdById === userId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You can only manage files for your own sermons');
    }

    if (!isAdmin && user.networkId !== sermon.networkId) {
      throw new ForbiddenException('Sermon belongs to a different network');
    }
  }
}
