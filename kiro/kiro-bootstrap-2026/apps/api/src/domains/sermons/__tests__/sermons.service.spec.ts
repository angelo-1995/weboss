import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SermonsService } from '../sermons.service';
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
    it('should throw ForbiddenException if user is not a network pastor', async () => {
      mockDb.networkLeader.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ title: 'Test', sermonDate: '2024-01-01T00:00:00Z' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create sermon and emit event', async () => {
      mockDb.networkLeader.findFirst.mockResolvedValue({ networkId: 'net-1' });
      mockRepo.create.mockResolvedValue({ id: 'sermon-1', status: 'PUBLISHED', networkId: 'net-1' });

      const result = await service.create(
        { title: 'Test Sermon', sermonDate: '2024-01-01T00:00:00Z' },
        'user-1',
      );

      expect(result.id).toBe('sermon-1');
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.created', expect.any(Object));
      expect(mockEvents.emit).toHaveBeenCalledWith('sermon.published', expect.any(Object));
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException for non-existent sermon', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for user from different network', async () => {
      mockRepo.findById.mockResolvedValue({ id: 's1', networkId: 'net-1', createdById: 'u2' });
      mockDb.user.findUnique.mockResolvedValue({ id: 'user-1', roles: ['MEMBER'], networkId: 'net-2' });

      await expect(service.findById('s1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
