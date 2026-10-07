import api from '@/lib/axios';

export interface BlockedUser {
  id: string;
  blockedUserId: string;
  reason?: string | null;
  createdAt: string;
  blockedUser: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null; city: string | null } | null;
  };
}

export const blocksApi = {
  /** Block a user by their ID */
  blockUser: (blockedUserId: string, reason?: string) =>
    api.post<{ id: string }>('/blocks', { blockedUserId, reason }).then((r) => r.data),

  /** Unblock a user by their ID */
  unblockUser: (blockedUserId: string) =>
    api.delete(`/blocks/${blockedUserId}`).then(() => ({ id: blockedUserId })),

  /** Get the current user's block list */
  getBlockList: () =>
    api.get<BlockedUser[]>('/blocks').then((r) => r.data),

  /** Check if the current user has blocked a specific user */
  getBlockStatus: (targetUserId: string) =>
    api
      .get<{ isBlocked: boolean; blockId: string | null }>(`/blocks/status/${targetUserId}`)
      .then((r) => r.data),
};
