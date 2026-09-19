import api from '@/lib/axios';
import type { Notification } from './types';

export interface NotifPrefs {
  id: string;
  userId: string;
  activityJoins: boolean;
  connectionRequests: boolean;
  messages: boolean;
  activityReminders: boolean;
  recommendations: boolean;
  ratings: boolean;
  updatedAt: string;
}

export type UpdateNotifPrefsDto = Partial<Omit<NotifPrefs, 'id' | 'userId' | 'updatedAt'>>;

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

  /** Get notification preferences from the backend */
  getPrefs: () =>
    api.get<NotifPrefs>('/notifications/preferences').then((r) => r.data),

  /** Save notification preferences to the backend */
  updatePrefs: (dto: UpdateNotifPrefsDto) =>
    api.patch<NotifPrefs>('/notifications/preferences', dto).then((r) => r.data),
};
