import api from '@/lib/axios';
import type { Activity, UserProfile } from './types';

export interface SearchResults {
  activities: Activity[];
  users: UserProfile[];
  skills: string[];
  interests: string[];
}

export const searchApi = {
  /** Global search across activities, users, skills */
  search: (q: string) =>
    api.get<SearchResults>('/search', { params: { q } }).then((r) => r.data),

  /** Search users only */
  searchUsers: (q: string) =>
    api.get<UserProfile[]>('/search/users', { params: { q } }).then((r) => r.data),

  /** Search activities only */
  searchActivities: (q: string) =>
    api.get<Activity[]>('/search/activities', { params: { q } }).then((r) => r.data),
};
