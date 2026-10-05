import api from '@/lib/axios';
import type { UserProfile } from './types';

export interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  avatarUrl?: string;
  interests?: string[];
  skills?: string[];
}

export interface ActivityConnectionPerson {
  id: string;
  username: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    city: string | null;
  } | null;
  reputationSummary: { averageScore: number; totalRatings: number } | null;
  sharedActivityCount: number;
  sharedActivities: Array<{ id: string; title: string; status: string }>;
}

export interface PeoplePage {
  items: ActivityConnectionPerson[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const usersApi = {
  /** Get current user's full profile */
  getMe: () => api.get<UserProfile>('/users/me').then((r) => r.data),

  /** Update current user profile */
  updateMe: (data: UpdateProfileData) =>
    api.patch<UserProfile>('/users/me', data).then((r) => r.data),

  /** Get a profile by username — requires activity relationship */
  getByUsername: (username: string) =>
    api.get<UserProfile>(`/users/${username}`).then((r) => r.data),

  /** Get people you've met through activities (activity-gated) */
  getPeople: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PeoplePage>('/people', { params }).then((r) => r.data),

  /**
   * @deprecated Replaced by getPeople() which enforces activity-based visibility.
   * Kept temporarily for backwards compatibility — returns same data as getPeople().
   */
  getRecommended: () =>
    api
      .get<PeoplePage>('/people', { params: { limit: 20 } })
      .then((r) => r.data.items),
};
