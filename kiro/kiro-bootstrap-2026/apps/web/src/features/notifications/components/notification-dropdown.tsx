'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { cn } from '@community-os/ui';
import { BadgeCount } from '@/components/feedback/badge-count';
import { useNotifications, useUnreadCount, useMarkAsRead } from '../hooks/use-notifications';
import type { Notification } from '../types/notification.types';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-PA', { month: 'short', day: 'numeric' });
}

function truncateBody(body: string | null, maxLength = 60): string {
  if (!body) return '';
  if (body.length <= maxLength) return body;
  return body.slice(0, maxLength).trimEnd() + '…';
}

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData } = useNotifications({ limit: 10 });
  const markAsRead = useMarkAsRead();

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.items ?? [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    // Navigate to sermon if it's a sermon notification
    if (notification.sermonId) {
      router.push(`/sermons/${notification.sermonId}` as any);
    } else if (notification.link) {
      router.push(notification.link as any);
    }

    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150 relative"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        <BadgeCount count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border/50 bg-card shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold">Notificaciones</h3>
          </div>

          {/* Notification list */}
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-accent/30 transition-colors border-b border-border/30 last:border-b-0',
                    !notification.isRead && 'bg-primary/5',
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="mt-1.5 shrink-0">
                      <div
                        className={cn(
                          'h-2 w-2 rounded-full',
                          notification.isRead ? 'bg-transparent' : 'bg-primary',
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p
                        className={cn(
                          'text-sm leading-tight truncate',
                          !notification.isRead ? 'font-medium text-foreground' : 'text-foreground/80',
                        )}
                      >
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-xs text-muted-foreground">
                          {truncateBody(notification.body)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notifications' as any);
                }}
                className="text-xs text-primary hover:underline"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
