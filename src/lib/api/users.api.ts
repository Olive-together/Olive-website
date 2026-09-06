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

export const usersApi = {
  /** Get current user's full profile */
  getMe: () => api.get<UserProfile>('/users/me').then((r) => r.data),

  /** Update current user profile */
  updateMe: (data: UpdateProfileData) =>
    api.patch<UserProfile>('/users/me', data).then((r) => r.data),

  /** Get a public profile by username */
  getByUsername: (username: string) =>
    api.get<UserProfile>(`/users/${username}`).then((r) => r.data),

  /** Get recommended people for current user */
  getRecommended: () =>
    api.get<UserProfile[]>('/recommendations/people').then((r) => r.data),
};
