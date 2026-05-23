import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SermonsService } from './sermons.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByNetwork: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  createView: vi.fn(),
  getViewsBySermon: vi.fn(),
  getAdminStats: vi.fn(),
  countFilesBySermon: vi.fn(),
  createFile: vi.fn(),
  findFileById: vi.fn(),
  deleteFile: vi.fn(),
  updateCoverImage: vi.fn(),
};

const mockEvents = { emit: vi.fn() };

const mockDb = {
  networkLeader: { findFirst: vi.fn() },
  user: { findUnique: vi.fn(), findMany: vi.fn() },
};

describe('SermonsService', () => {
  let service: SermonsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SermonsService(mockRepo as any, mockEvents as any, mockDb as any);
  });

  describe('create', () => {
    it('should create sermon with PUBLISHED status when no publishAt', async () => {
      mockDb.networkLeader.findFirst.mockResolvedValue({ networkId: 'net-1' });
      mockRepo.create.mockResolvedValue({
        id: 'sermon-1',
        title: 'Sunday Message',
        status: 'PUBLISHED',
        networkId: 'net-1',
        createdById: 'user-1',
      });

      const result = await service.create(
        { title: 'Sunday Message', sermonDate: '2024-06-01T10:00:00Z' },
        'user-1',
      );

      expect(result.status).toBe('PUBLISHED');
      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sunday Message',
        networkId: 'net-1',
        createdById: 'user-1',
      }));
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.created', expect.any(Object));
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.published', expect.any(Object));
    });

    it('should create sermon with SCHEDULED status when publishAt is future', async () => {
      mockDb.networkLeader.findFirst.mockResolvedValue({ networkId: 'net-1' });
      mockRepo.create.mockResolvedValue({
        id: 'sermon-2',
        title: 'Future Sermon',
        status: 'SCHEDULED',
        networkId: 'net-1',
        createdById: 'user-1',
      });

      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const result = await service.create(
        { title: 'Future Sermon', sermonDate: '2024-06-01T10:00:00Z', publishAt: futureDate },
        'user-1',
      );

      expect(result.status).toBe('SCHEDULED');
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.created', expect.any(Object));
      // Should NOT emit sermon.published for SCHEDULED
      expect(mockEvents.emit).not.toHaveBeenCalledWith('sermon.published', expect.any(Object));
    });

    it('should throw ForbiddenException when user is not a network pastor', async () => {
      mockDb.networkLeader.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ title: 'Test', sermonDate: '2024-01-01T00:00:00Z' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when sermon does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'Updated' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the creator', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'sermon-1',
        createdById: 'other-user',
        networkId: 'net-1',
      });
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        roles: ['MEMBER'],
        networkId: 'net-1',
      });

      await expect(
        service.update('sermon-1', { title: 'Hacked' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt and emit event', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'sermon-1',
        createdById: 'user-1',
        networkId: 'net-1',
      });
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        roles: ['MEMBER'],
        networkId: 'net-1',
      });
      mockRepo.softDelete.mockResolvedValue({ id: 'sermon-1', deletedAt: new Date() });

      await service.softDelete('sermon-1', 'user-1');

      expect(mockRepo.softDelete).toHaveBeenCalledWith('sermon-1');
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.deleted', expect.objectContaining({
        sermonId: 'sermon-1',
        networkId: 'net-1',
        userId: 'user-1',
      }));
    });
  });

  describe('findById', () => {
    it('should throw ForbiddenException when user is from different network', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'sermon-1',
        networkId: 'net-1',
        createdById: 'other-user',
      });
      mockDb.user.findUnique.mockResolvedValue({
        id: 'user-1',
        roles: ['MEMBER'],
        networkId: 'net-2',
      });

      await expect(service.findById('sermon-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to access any sermon', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'sermon-1',
        networkId: 'net-1',
        createdById: 'other-user',
      });
      mockDb.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        roles: ['ADMIN'],
        networkId: 'net-2',
      });
      mockRepo.createView.mockResolvedValue({});

      const result = await service.findById('sermon-1', 'admin-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('sermon-1');
    });
  });
});
