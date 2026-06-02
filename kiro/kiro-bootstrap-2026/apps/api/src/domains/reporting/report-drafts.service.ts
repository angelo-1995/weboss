import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class ReportDraftsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Save or update a draft for a user+group combination.
   * Uses upsert: one draft per user per group.
   */
  async saveDraft(userId: string, groupId: string, formData: Record<string, unknown>, currentStep: number): Promise<any> {
    return this.db.cellReportDraft.upsert({
      where: {
        userId_groupId: { userId, groupId },
      },
      update: {
        formData: formData as any,
        currentStep,
      },
      create: {
        userId,
        groupId,
        formData: formData as any,
        currentStep,
      },
    });
  }

  /**
   * Get the active draft for a user+group.
   * Returns null if no draft exists.
   */
  async getDraft(userId: string, groupId: string): Promise<any> {
    return this.db.cellReportDraft.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });
  }

  /**
   * Delete a draft after successful submission or explicit discard.
   */
  async deleteDraft(userId: string, groupId: string): Promise<any> {
    const draft = await this.db.cellReportDraft.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!draft) {
      throw new NotFoundException('No draft found for this user and group');
    }

    return this.db.cellReportDraft.delete({
      where: { userId_groupId: { userId, groupId } },
    });
  }

  /**
   * Get all drafts for a user (for listing in UI).
   */
  async getUserDrafts(userId: string): Promise<any> {
    return this.db.cellReportDraft.findMany({
      where: { userId },
      include: {
        group: { select: { id: true, name: true, code: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
