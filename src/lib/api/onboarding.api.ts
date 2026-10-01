import api from '@/lib/axios';

export interface InterestItem {
  id: string;
  name: string;
  slug: string;
  category?: { name: string; iconUrl: string | null };
}

export interface SkillItem {
  id: string;
  name: string;
  slug: string;
  category?: { name: string; iconUrl: string | null };
}

export const onboardingApi = {
  /** Fetch all available interests (public endpoint) */
  getInterests: (): Promise<InterestItem[]> =>
    api.get<InterestItem[]>('/interests').then((r) => r.data),

  /** Fetch all available skills (public endpoint) */
  getSkills: (): Promise<SkillItem[]> =>
    api.get<SkillItem[]>('/skills').then((r) => r.data),

  /** Update user location */
  updateLocation: (data: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
  }) => api.put('/locations/me', data).then((r) => r.data),

  /** Bulk-set interests (replaces existing) */
  setInterests: (interestNames: string[]) =>
    api.patch('/users/me', { interests: interestNames }).then((r) => r.data),

  /** Bulk-set skills (replaces existing) */
  setSkills: (skillNames: string[]) =>
    api.patch('/users/me', { skills: skillNames }).then((r) => r.data),
};
