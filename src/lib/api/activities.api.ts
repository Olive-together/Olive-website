import api from '@/lib/axios';
import type { Activity, CursorPaginatedResponse, Participant } from './types';

export interface CreateActivityData {
  title: string;
  description: string;
  category: string;
  startTime: string; // ISO string
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
  }) =>
    api
      .get<CursorPaginatedResponse<Activity>>('/activities', { params })
      .then((r) => r.data),

  /** Get a single activity by ID */
  getById: (id: string) =>
    api.get<Activity>(`/activities/${id}`).then((r) => r.data),

  /** Create a new activity */
  create: (data: CreateActivityData) =>
    api.post<Activity>('/activities', data).then((r) => r.data),

  /** Update an activity (host only) */
  update: (id: string, data: Partial<CreateActivityData>) =>
    api.patch<Activity>(`/activities/${id}`, data).then((r) => r.data),

  /** Delete an activity (host only) */
  delete: (id: string) =>
    api.delete(`/activities/${id}`).then((r) => r.data),

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
  getRecommended: () =>
    api.get<Activity[]>('/recommendations/activities').then((r) => r.data),
};
