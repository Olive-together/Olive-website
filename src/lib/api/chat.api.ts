import api from '@/lib/axios';
import type { Conversation, Message, CursorPaginatedResponse } from './types';

function mapConversation(c: any): Conversation {
  return {
    ...c,
    type: c.type ?? 'DIRECT',
    participants: c.members?.map((m: any) => m.user || { id: m.userId, username: 'Unknown' }) || [],
    lastMessage: c.messages?.[0],
    activity: c.activity ?? null,
  };
}

export const chatApi = {
  /** Get all conversations for the current user. Optionally filter by type. */
  getConversations: (type?: 'DIRECT' | 'GROUP') =>
    api
      .get<any[]>('/chat/conversations', { params: type ? { type } : {} })
      .then((r) => r.data.map(mapConversation)),

  /** Get (or create) a direct conversation with a user */
  createConversation: (targetUserId: string) =>
    api.post<any>('/chat/conversations', { targetUserId }).then((r) => mapConversation(r.data)),

  /** Get messages for a conversation (cursor-paginated) */
  getMessages: (conversationId: string, cursor?: string) =>
    api
      .get<CursorPaginatedResponse<Message>>(`/chat/conversations/${conversationId}/messages`, {
        params: { cursor },
      })
      .then((r) => r.data),

  /** Get the group conversation for an activity (user must be a participant) */
  getActivityChat: (activityId: string) =>
    api.get<any>(`/activities/${activityId}/chat`).then((r) => mapConversation(r.data)),
};
