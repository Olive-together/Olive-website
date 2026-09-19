import api from '@/lib/axios';

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  scheduledAt: string | null;
  endsAt: string | null;
  address: string;
  city: string;
  state: string;
  isFree: boolean;
  price: number | null;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: string;
  creator: {
    id: string;
    username: string;
    email?: string;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  };
  _count: { participants: number };
}

export interface AdminStats {
  users: { total: number; active: number; suspended: number; banned: number };
  activities: { total: number; active: number };
  reports: { total: number; pending: number };
}

export interface AdminPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminApi = {
  /** Platform dashboard statistics */
  getStats: (): Promise<AdminStats> =>
    api.get<AdminStats>('/admin/stats').then((r) => r.data),

  /** List all activities with optional filters */
  getActivities: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    creatorId?: string;
  }): Promise<AdminPaginatedResponse<AdminActivity>> =>
    api.get<AdminPaginatedResponse<AdminActivity>>('/admin/activities', { params }).then((r) => r.data),

  /** Admin-force-delete an activity */
  deleteActivity: (id: string, reason: string) =>
    api.delete(`/admin/activities/${id}`, { data: { reason } }).then((r) => r.data),

  /** Send an admin system notification to the creator of an activity */
  messageCreator: (activityId: string, message: string): Promise<{ sent: boolean }> =>
    api
      .post<{ sent: boolean }>(`/admin/activities/${activityId}/message-creator`, { message })
      .then((r) => r.data),
};
