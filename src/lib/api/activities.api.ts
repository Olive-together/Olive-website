import api from '@/lib/axios';
import type { Activity, CursorPaginatedResponse } from './types';

function getCurrentUserId(): string | undefined {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? undefined;
  } catch {
    return undefined;
  }
}

export interface CreateActivityData {
  title: string;
  description: string;
  category: string;
  /** ISO string — maps to the backend's scheduledAt field */
  scheduledAt?: string;
  /** ISO string — maps to the backend's endsAt field */
  endsAt?: string;
  /** @deprecated Use scheduledAt instead; kept for backwards-compat */
  startTime?: string;
  endTime?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants: number;
  isFree: boolean;
  price?: number;
  tags?: string[];
}

export const activitiesApi = {
  /** List activities with optional filters */
  getAll: (params?: {
    city?: string;
    state?: string;
    lat?: string;
    lng?: string;
    radiusKm?: string;
    category?: string;
    cursor?: string;
    limit?: number;
    status?: string;
    timeline?: 'upcoming' | 'past';
    userId?: string;
  }) => {
    const userId = params?.userId ?? getCurrentUserId();
    const queryParams = { ...params, ...(userId ? { userId } : {}) };
    return api
      .get<CursorPaginatedResponse<Activity>>('/activities', { params: queryParams })
      .then((r) => r.data);
  },

  /** Get a single activity by ID */
  getById: (id: string) =>
    api.get<Activity>(`/activities/${id}`).then((r) => r.data),

  /** Create a new activity */
  create: (data: CreateActivityData) =>
    api.post<Activity>('/activities', data).then((r) => r.data),

  /** Update an activity (host only) */
  update: (id: string, data: Partial<CreateActivityData>) =>
    api.patch<Activity>(`/activities/${id}`, data).then((r) => r.data),

  /** Delete an activity (host or admin) */
  delete: (id: string, reason?: string) =>
    api.delete(`/activities/${id}`, { data: reason ? { reason } : undefined }).then((r) => r.data),

  /** Join an activity */
  join: (id: string) =>
    api.post(`/activities/${id}/join`).then((r) => r.data),

  /** Leave an activity */
  leave: (id: string) =>
    api.post(`/activities/${id}/leave`).then((r) => r.data),

  /** Get participants list */
  getParticipants: (id: string) =>
    api.get<any[]>(`/activities/${id}/participants`).then((r) => r.data.map((p: any) => p.user || p)),

  /** Get recommended activities for current user */
  getRecommended: () => {
    const userId = getCurrentUserId();
    return api
      .get<Activity[]>('/recommendations/activities', { params: userId ? { userId } : {} })
      .then((r) => r.data);
  },
};

