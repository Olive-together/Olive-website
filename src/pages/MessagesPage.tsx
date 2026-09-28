import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search, Send, MoreVertical, ArrowLeft, Users, MessageSquare, X,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '@/lib/api/chat.api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import type { Message, Conversation } from '@/lib/api/types';
import { useLocation } from 'react-router-dom';
import { lenisStore } from '@/lib/lenisStore';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAvatar(avatarUrl: string | null | undefined, seed: string) {
  return avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvTime(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return 'now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return formatTime(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getOtherParticipant(conv: Conversation | undefined, myId: string) {
  if (!conv) return null;
  return conv.participants.find((p) => p.id !== myId) ?? conv.participants[0];
}

function convMeta(conv: Conversation, myId: string) {
  if (conv.type === 'GROUP') {
    return {
      name: conv.name ?? conv.activity?.title ?? 'Group Chat',
      avatar: null as string | null,
      isGroup: true,
    };
  }
  const other = getOtherParticipant(conv, myId);
  return {
    name: other?.profile?.displayName ?? other?.username ?? 'Unknown',
    avatar: getAvatar(other?.profile?.avatarUrl, other?.username ?? ''),
    isGroup: false,
  };
}

/** Determines grouping context for a message */
function getGrouping(msgs: Message[], idx: number) {
  const curr = msgs[idx];
  const prev = msgs[idx - 1];
  const next = msgs[idx + 1];
  const GAP = 5 * 60 * 1000; // 5 min

  const samePrev =
    prev &&
    prev.sender?.id === curr.sender?.id &&
    new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() < GAP;
  const sameNext =
    next &&
    next.sender?.id === curr.sender?.id &&
    new Date(next.createdAt).getTime() - new Date(curr.createdAt).getTime() < GAP;

  return { isFirst: !samePrev, isLast: !sameNext };
}

// ── Singleton socket ──────────────────────────────────────────────────────────
let socket: Socket | null = null;
function getSocket(token: string) {
  if (!socket) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3000';
    socket = io(`${baseUrl}/chat`, { auth: { token }, transports: ['websocket'] });
  }
  return socket;
}

// ── GroupMembersPanel ─────────────────────────────────────────────────────────
function GroupMembersPanel({
  conv, myId, onDm, onClose,
}: {
  conv: Conversation; myId: string; onDm: (userId: string) => void; onClose: () => void;
}) {
  return (
    <div
      className="absolute top-[4.5rem] right-3 z-20 w-72 rounded-2xl p-4 shadow-xl animate-scale-in"
      style={{
        backgroundColor: 'var(--bg-card-el)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-dm-hover)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          Members ({conv.participants.length})
        </p>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {conv.participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 py-1">
            <img
              src={getAvatar(p.profile?.avatarUrl, p.username)}
              alt={p.username}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              style={{ border: '1.5px solid var(--border-subtle)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {p.profile?.displayName ?? p.username}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>@{p.username}</p>
            </div>
            {p.id !== myId && (
              <button
                onClick={() => onDm(p.id)}
                title="Send DM"
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent-bright)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {conv.activity && (
        <p className="text-xs mt-3 pt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
          Group for:{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-bright)' }}>{conv.activity.title}</span>
          {conv.activity.status === 'CANCELLED' && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-500">
              Cancelled
            </span>
          )}
        </p>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-10 select-none">
      {/* Illustrated chat bubbles */}
      <div className="relative w-32 h-24 mb-8">
        {/* Big incoming bubble */}
        <div
          className="absolute left-0 top-4 w-20 h-12 rounded-2xl rounded-bl-sm shadow-lg"
          style={{ backgroundColor: 'var(--bg-card-el)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 h-full px-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }} />
          </div>
        </div>
        {/* Small outgoing bubble */}
        <div
          className="absolute right-0 top-0 w-16 h-9 rounded-2xl rounded-br-sm"
          style={{ background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-hover))' }}
        >
          <div className="flex items-center gap-1 h-full px-2.5">
            <div className="flex-1 h-1.5 rounded-full bg-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
        {/* Bottom incoming bubble */}
        <div
          className="absolute left-4 bottom-0 w-24 h-9 rounded-2xl rounded-bl-sm shadow"
          style={{ backgroundColor: 'var(--bg-card-el)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 h-full px-3">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }} />
            <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }} />
          </div>
        </div>
      </div>

      <h3
        className="font-bold text-xl mb-2"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        Your conversations
      </h3>
      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
        Select a conversation to start chatting
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Join activities to access their group chats
      </p>
    </div>
  );
}

// ── Group Avatar ──────────────────────────────────────────────────────────────
function GroupAvatar({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const dim = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  return (
    <div
      className={cn(dim, 'rounded-2xl flex items-center justify-center flex-shrink-0')}
      style={{ background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-hover))' }}
    >
      <Users className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} style={{ color: 'rgba(255,255,255,0.9)' }} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function MessagesPage() {
  const location = useLocation();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    location.state?.conversationId ?? null,
  );
  const [activeTab, setActiveTab] = useState<'ALL' | 'DIRECT' | 'GROUP'>('ALL');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  useEffect(() => {
    const incomingId = location.state?.conversationId;
    if (!incomingId) return;
    const timer = setTimeout(() => {
      const exists = conversations.some((c) => c.id === incomingId);
      if (!exists && conversations.length >= 0) refetchConversations();
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.conversationId, conversations.length]);

  const { data: msgData } = useQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: () => chatApi.getMessages(selectedConvId!),
    enabled: !!selectedConvId,
  });

  useEffect(() => {
    if (msgData?.items) setMessages(msgData.items.slice().reverse());
  }, [msgData]);

  useEffect(() => {
    if (!accessToken) return;
    const sock = getSocket(accessToken);
    sock.on('message:new', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) =>
          m.id === msg.id ||
          (m.content === msg.content &&
            new Date(msg.createdAt).getTime() - new Date(m.createdAt).getTime() < 5000),
        )) return prev;
        return [...prev, msg];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return () => { sock.off('message:new'); };
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (selectedConvId && accessToken) {
      getSocket(accessToken).emit('conversation:join', { conversationId: selectedConvId });
    }
  }, [selectedConvId, accessToken]);

  // Pause Lenis smooth scroll and lock the body scroll while the
  // messages page is active so each panel scrolls independently.
  useEffect(() => {
    lenisStore.pause();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      lenisStore.resume();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const canShowChat = !!selectedConvId && (!!selectedConv || !!msgData);

  const sendMessage = () => {
    if (!message.trim() || !selectedConvId || !accessToken) return;
    const sock = getSocket(accessToken);
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content: message,
      createdAt: new Date().toISOString(),
      sender: { id: user!.id, username: user!.username, profile: user!.profile },
    };
    setMessages((prev) => [...prev, tempMsg]);
    sock.emit('message:send', { conversationId: selectedConvId, content: message });
    setMessage('');
    inputRef.current?.focus();
  };

  const startDm = async (targetUserId: string) => {
    try {
      const conv = await chatApi.createConversation(targetUserId);
      setSelectedConvId(conv.id);
      setShowMembers(false);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch { /* silent */ }
  };

  const filteredConvs = conversations.filter((c) => {
    if (activeTab === 'DIRECT' && c.type !== 'DIRECT') return false;
    if (activeTab === 'GROUP' && c.type !== 'GROUP') return false;
    if (!search || !user) return true;
    const meta = convMeta(c, user.id);
    return meta.name.toLowerCase().includes(search.toLowerCase());
  });

  const chatHeader =
    selectedConv && user
      ? convMeta(selectedConv, user.id)
      : selectedConvId
      ? { name: 'Group Chat', avatar: null, isGroup: true }
      : null;
  const isGroupConv = selectedConv?.type === 'GROUP' || (canShowChat && !selectedConv);

  return (
    <div className="flex-1 flex h-full overflow-hidden animate-fade-in">

      {/* ══ Conversation List Panel ══════════════════════════════════════════ */}
      <div
        className={cn(
          'flex flex-col transition-all flex-shrink-0',
          selectedConvId ? 'hidden md:flex md:w-[300px] lg:w-[340px]' : 'flex w-full md:w-[300px] lg:w-[340px]',
        )}
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h1
            className="font-bold text-lg mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Messages
          </h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          {/* Tab filter */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            {(['ALL', 'DIRECT', 'GROUP'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={
                  activeTab === tab
                    ? {
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--accent-bright)',
                        boxShadow: 'var(--shadow-dm)',
                        border: '1px solid var(--border-accent)',
                      }
                    : { color: 'var(--text-muted)', backgroundColor: 'transparent' }
                }
              >
                {tab === 'ALL' ? 'All' : tab === 'DIRECT' ? 'Direct' : 'Groups'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
              >
                {activeTab === 'GROUP'
                  ? <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  : <MessageSquare className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                }
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {activeTab === 'GROUP' ? 'No group chats' : 'No conversations'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'GROUP' ? 'Join an activity to start a group chat' : 'Connect with people to chat'}
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const meta = convMeta(conv, user?.id ?? '');
              const isSelected = selectedConvId === conv.id;
              const hasUnread = (conv.unreadCount ?? 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConvId(conv.id); setShowMembers(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left relative group"
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-badge)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-bright)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {meta.isGroup ? (
                      <GroupAvatar size="lg" />
                    ) : (
                      <img
                        src={meta.avatar!}
                        alt={meta.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                        style={{ border: '1.5px solid var(--border-subtle)' }}
                      />
                    )}
                    {/* Online dot — always show for DMs as decorative */}
                    {!meta.isGroup && (
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: '#4ade80',
                          border: '2px solid var(--bg-panel)',
                        }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p
                        className="text-sm truncate"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: hasUnread ? 700 : 600,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {meta.name}
                      </p>
                      {conv.updatedAt && (
                        <p className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {formatConvTime(conv.updatedAt)}
                        </p>
                      )}
                    </div>

                    {conv.lastMessage ? (
                      <p
                        className="text-xs truncate"
                        style={{
                          color: hasUnread ? 'var(--text-secondary)' : 'var(--text-muted)',
                          fontWeight: hasUnread ? 600 : 400,
                        }}
                      >
                        {meta.isGroup && conv.lastMessage.sender && (
                          <span style={{ color: 'var(--accent)' }}>
                            {conv.lastMessage.sender.id === user?.id
                              ? 'You'
                              : (conv.lastMessage.sender.username ?? 'Someone')}
                            {': '}
                          </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                        No messages yet
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <span
                      className="w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-hover))' }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ══ Chat Area ════════════════════════════════════════════════════════ */}
      {canShowChat && chatHeader ? (
        <div
          className={cn('flex flex-col flex-1 min-w-0 relative', selectedConvId ? 'flex' : 'hidden md:flex')}
        >
          {/* ── Chat Header (glass) ── */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0 relative z-10 glass"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={() => { setSelectedConvId(null); setShowMembers(false); }}
              className="md:hidden p-2 rounded-xl transition-colors mr-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
            {isGroupConv ? (
              <GroupAvatar size="sm" />
            ) : (
              <div className="relative flex-shrink-0">
                <img
                  src={getAvatar(
                    getOtherParticipant(selectedConv, user!.id)?.profile?.avatarUrl,
                    getOtherParticipant(selectedConv, user!.id)?.username ?? '',
                  )}
                  alt={chatHeader.name}
                  className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: '1.5px solid var(--border-subtle)' }}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#4ade80', border: '2px solid var(--bg-card)' }}
                />
              </div>
            )}

            {/* Name & status */}
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm truncate"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
              >
                {chatHeader.name}
              </p>
              {isGroupConv ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedConv?.participants?.length ?? 0} member{selectedConv?.participants?.length !== 1 ? 's' : ''}
                  {selectedConv?.activity?.status === 'CANCELLED' && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-500">
                      Cancelled
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                  Active now · @{getOtherParticipant(selectedConv, user!.id)?.username}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isGroupConv && (
                <button
                  onClick={() => setShowMembers((v) => !v)}
                  className="p-2 rounded-xl transition-colors"
                  style={{
                    backgroundColor: showMembers ? 'var(--bg-badge)' : 'transparent',
                    color: showMembers ? 'var(--accent-bright)' : 'var(--text-muted)',
                  }}
                  title="View members"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Members panel */}
          {showMembers && isGroupConv && selectedConv && (
            <GroupMembersPanel
              conv={selectedConv}
              myId={user!.id}
              onDm={startDm}
              onClose={() => setShowMembers(false)}
            />
          )}

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 chat-bg" data-lenis-prevent>
            {messages.map((msg, idx) => {
              const isMe = msg.sender?.id === user?.id;
              const { isFirst, isLast } = getGrouping(messages, idx);

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isMe ? 'justify-end' : 'justify-start',
                    isFirst ? 'mt-3' : 'mt-0.5',
                  )}
                >
                  {/* Incoming avatar — only on last message of a group */}
                  {!isMe && (
                    <div className="w-7 flex-shrink-0">
                      {isLast ? (
                        <img
                          src={getAvatar(msg.sender?.profile?.avatarUrl, msg.sender?.username ?? '')}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                          style={{ border: '1.5px solid var(--border-subtle)' }}
                        />
                      ) : null}
                    </div>
                  )}

                  <div className={cn('flex flex-col max-w-xs lg:max-w-sm', isMe ? 'items-end' : 'items-start')}>
                    {/* Sender name — groups, incoming, first in group only */}
                    {isGroupConv && !isMe && isFirst && (
                      <p
                        className="text-[11px] font-semibold mb-1 ml-1"
                        style={{ color: 'var(--accent)' }}
                      >
                        {msg.sender?.profile?.displayName ?? msg.sender?.username ?? 'Unknown'}
                      </p>
                    )}

                    <div className={isMe ? 'chat-bubble-out' : 'chat-bubble-in'}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p
                        className="text-[10px] mt-1 leading-none"
                        style={{ color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', textAlign: isMe ? 'right' : 'left' }}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* My avatar — only on last message of group */}
                  {isMe && (
                    <div className="w-7 flex-shrink-0">
                      {isLast ? (
                        <img
                          src={getAvatar(user?.profile?.avatarUrl, user?.username ?? '')}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                          style={{ border: '1.5px solid var(--border-subtle)' }}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Composer ── */}
          <div
            className="flex-shrink-0 p-4"
            style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="composer flex items-center gap-3 px-4 py-2.5">
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={
                  isGroupConv
                    ? `Message ${chatHeader.name}…`
                    : `Message ${
                        getOtherParticipant(selectedConv, user!.id)?.profile?.displayName ??
                        getOtherParticipant(selectedConv, user!.id)?.username ??
                        ''
                      }…`
                }
                className="flex-1 bg-transparent border-none outline-none text-sm"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
              Press Enter to send
            </p>
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
