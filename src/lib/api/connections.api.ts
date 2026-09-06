import api from '@/lib/axios';
import type { Connection } from './types';

export const connectionsApi = {
  send: (toUserId: string) =>
    api.post<Connection>('/connections/request', { toUserId }).then((r) => r.data),

  /** Accept a connection request */
  accept: (connectionId: string) =>
    api.post<Connection>(`/connections/${connectionId}/accept`).then((r) => r.data),

  /** Reject a connection request */
  reject: (connectionId: string) =>
    api.post(`/connections/${connectionId}/reject`).then((r) => r.data),

  /** Remove / disconnect */
  remove: (connectionId: string) =>
    api.delete(`/connections/${connectionId}`).then((r) => r.data),

  /** Get all connections (accepted) */
  getAll: () =>
    api.get<Connection[]>('/connections').then((r) => r.data),

  /** Get pending connection requests */
  getPending: () =>
    api.get<Connection[]>('/connections/pending').then((r) => r.data),
};
