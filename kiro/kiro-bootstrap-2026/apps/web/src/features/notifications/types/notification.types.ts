export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  sermonId: string | null;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  nextCursor: string | null;
  total: number;
}
