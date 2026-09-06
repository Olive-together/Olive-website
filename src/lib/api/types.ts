// Shared types mirroring the backend Prisma/DTO shapes

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  requestId?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

// ── User / Profile ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  } | null;
  userInterests?: Array<{ interest: { name: string; categoryId: string } }>;
  userSkills?: Array<{ skill: { name: string; categoryId: string } }>;
  reputationSummary: {
    totalPoints: number;
    level: number;
    activitiesHosted: number;
    activitiesJoined: number;
    connectionsCount: number;
  } | null;
}

// ── Activity ──────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  startTime: string;
  endTime: string | null;
  address: string;
  city: string;
  state: string;
  maxParticipants: number;
  isFree: boolean;
  price: number | null;
  coverImageUrl: string | null;
  tags: string[];
  host: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  };
  _count: {
    participants: number;
  };
  isJoined?: boolean;
  /** ID of the group conversation associated with this activity (backend returns this in findOne) */
  groupConversation?: { id: string } | null;
}

export interface Participant {
  id: string;
  username: string;
  profile: { displayName: string | null; avatarUrl: string | null } | null;
}

// ── Connection ────────────────────────────────────────────────────────────

export interface Connection {
  id: string;
  status: string;
  createdAt: string;
  fromUser?: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null; city: string | null } | null;
  };
  toUser?: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null; city: string | null } | null;
  };
}

// ── Chat ──────────────────────────────────────────────────────────────────

export type ConversationType = 'DIRECT' | 'GROUP';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string | null;
  updatedAt: string;
  /** For DIRECT convs — the other participant(s) */
  participants: Array<{
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; username: string };
  };
  unreadCount?: number;
  /** For GROUP convs — the linked activity summary */
  activity?: {
    id: string;
    title: string;
    status: string;
    coverUrl?: string | null;
  } | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null } | null;
  };
}

// ── Notification ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  referenceId: string | null;
  referenceType: string | null;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}
