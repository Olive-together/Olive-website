import api from '@/lib/axios';
import type { Notification } from './types';

export const notificationsApi = {
  /** Get all notifications for the current user */
  getAll: () =>
    api.get<any>('/notifications').then((r) => r.data.items || []),

  /** Get count of unread notifications */
  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  /** Mark a single notification as read */
  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  /** Mark all notifications as read */
  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};
