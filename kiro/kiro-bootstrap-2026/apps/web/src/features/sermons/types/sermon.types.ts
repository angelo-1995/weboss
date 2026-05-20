export interface Sermon {
  id: string;
  networkId: string;
  createdById: string;
  title: string;
  description: string | null;
  sermonDate: string;
  coverImageUrl: string | null;
  videoUrl: string | null;
  externalLink: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  publishAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  files: SermonFile[];
  createdBy: { id: string; firstName: string; lastName: string };
  _count: { views: number };
}

export interface SermonFile {
  id: string;
  sermonId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface SermonAdminStats {
  totalPublished: number;
  totalViews: number;
  pendingScheduled: number;
  avgViewsPerSermon: number;
}

export interface SermonViewAnalytics {
  totalViews: number;
  totalMembers: number;
  viewedMembers: { id: string; firstName: string; lastName: string; email: string }[];
  notViewedMembers: { id: string; firstName: string; lastName: string; email: string }[];
}

export interface PaginatedSermons {
  items: Sermon[];
  nextCursor: string | null;
  total: number;
}

export interface CreateSermonDto {
  title: string;
  description?: string;
  sermonDate: string;
  videoUrl?: string;
  externalLink?: string;
  publishAt?: string;
}

export interface UpdateSermonDto extends Partial<CreateSermonDto> {}
