import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search, Send, MoreVertical, ArrowLeft, Users, MessageSquare, Hash,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '@/lib/api/chat.api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import type { Message, Conversation } from '@/lib/api/types';
import { useLocation } from 'react-router-dom';

function getAvatar(avatarUrl: string | null | undefined, seed: string) {
  return avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getOtherParticipant(conv: Conversation, myId: string) {
  return conv.participants.find((p) => p.id !== myId) ?? conv.participants[0];
}

/** Display name + avatar for a conversation in the sidebar */
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
  conv,
  myId,
  onDm,
  onClose,
}: {
  conv: Conversation;
  myId: string;
  onDm: (userId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-14 right-0 z-10 w-72 bg-white rounded-2xl shadow-xl border border-olive-100 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-olive-900 text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
          Members ({conv.participants.length})
        </p>
        <button onClick={onClose} className="text-olive-400 hover:text-olive-700 text-lg leading-none">✕</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {conv.participants.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <img
              src={getAvatar(p.profile?.avatarUrl, p.username)}
              alt={p.username}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-olive-900 truncate">
                {p.profile?.displayName ?? p.username}
              </p>
              <p className="text-xs text-olive-400">@{p.username}</p>
            </div>
            {p.id !== myId && (
              <button
                onClick={() => onDm(p.id)}
                title="Send DM"
                className="flex-shrink-0 p-1.5 rounded-xl hover:bg-olive-100 text-olive-500 hover:text-olive-700 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {conv.activity && (
        <p className="text-xs text-olive-400 mt-3 pt-3 border-t border-olive-100">
          Group for: <span className="font-medium text-olive-600">{conv.activity.title}</span>
          {conv.activity.status === 'CANCELLED' && (
            <span className="ml-1 px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px]">Cancelled</span>
          )}
        </p>
      )}
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
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.getConversations(),
  });

  const { data: msgData } = useQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: () => chatApi.getMessages(selectedConvId!),
    enabled: !!selectedConvId,
  });

  // Sync messages from query
  useEffect(() => {
    if (msgData?.items) setMessages(msgData.items.slice().reverse());
  }, [msgData]);

  // Socket.IO real-time
  useEffect(() => {
    if (!accessToken) return;
    const sock = getSocket(accessToken);
    sock.on('message:new', (msg: Message) => {
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.id === msg.id ||
              (m.content === msg.content &&
                new Date(msg.createdAt).getTime() - new Date(m.createdAt).getTime() < 5000),
          )
        )
          return prev;
        return [...prev, msg];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return () => { sock.off('message:new'); };
  }, [accessToken, queryClient]);

  // Join socket room when conversation selected
  useEffect(() => {
    if (selectedConvId && accessToken) {
      getSocket(accessToken).emit('conversation:join', { conversationId: selectedConvId });
    }
  }, [selectedConvId, accessToken]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

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
  };

  /** Start a DM with a group member — navigate to or create the direct conv */
  const startDm = async (targetUserId: string) => {
    try {
      const conv = await chatApi.createConversation(targetUserId);
      setSelectedConvId(conv.id);
      setShowMembers(false);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      // silent
    }
  };

  // Filter conversations by tab + search
  const filteredConvs = conversations.filter((c) => {
    if (activeTab === 'DIRECT' && c.type !== 'DIRECT') return false;
    if (activeTab === 'GROUP' && c.type !== 'GROUP') return false;
    if (!search || !user) return true;
    const meta = convMeta(c, user.id);
    return meta.name.toLowerCase().includes(search.toLowerCase());
  });

  const chatHeader = selectedConv && user ? convMeta(selectedConv, user.id) : null;
  const isGroupConv = selectedConv?.type === 'GROUP';

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] lg:h-screen overflow-hidden animate-fade-in">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex flex-col border-r border-olive-100 bg-white transition-all',
        selectedConvId ? 'hidden md:flex md:w-80 lg:w-96' : 'flex w-full md:w-80 lg:w-96',
      )}>
        <div className="p-4 border-b border-olive-100">
          <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-3">
            Messages 💬
          </h1>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
          {/* Tab filter */}
          <div className="flex gap-1 bg-olive-50 rounded-xl p-1">
            {(['ALL', 'DIRECT', 'GROUP'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all',
                  activeTab === tab
                    ? 'bg-white text-olive-800 shadow-card'
                    : 'text-olive-500 hover:text-olive-700',
                )}
              >
                {tab === 'ALL' ? 'All' : tab === 'DIRECT' ? '💬 DMs' : '👥 Groups'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-olive-400">
              <p className="text-4xl mb-2">{activeTab === 'GROUP' ? '👥' : '💬'}</p>
              <p className="text-sm">
                {activeTab === 'GROUP'
                  ? 'Join an activity to access group chats'
                  : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const meta = convMeta(conv, user?.id ?? '');
              return (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConvId(conv.id); setShowMembers(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-olive-50 transition-colors border-b border-olive-50',
                    selectedConvId === conv.id && 'bg-olive-50',
                  )}
                >
                  {/* Avatar / Icon */}
                  <div className="relative flex-shrink-0">
                    {meta.isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <img src={meta.avatar!} alt={meta.name} className="w-12 h-12 rounded-full" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-olive-900 text-sm truncate">{meta.name}</p>
                      {conv.updatedAt && (
                        <p className="text-xs text-olive-400 flex-shrink-0">{formatTime(conv.updatedAt)}</p>
                      )}
                    </div>
                    {conv.lastMessage ? (
                      <p className="text-xs text-olive-500 truncate mt-0.5">
                        {meta.isGroup && (
                          <span className="font-medium text-olive-600">
                            {conv.lastMessage.sender.id === user?.id
                              ? 'You'
                              : conv.lastMessage.sender.username}
                            {': '}
                          </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-olive-400 mt-0.5 italic">No messages yet</p>
                    )}
                  </div>
                  {(conv.unreadCount ?? 0) > 0 && (
                    <span className="w-5 h-5 bg-olive-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ────────────────────────────────────────────────────── */}
      {selectedConvId && selectedConv && chatHeader ? (
        <div className={cn('flex flex-col flex-1 min-w-0 relative', selectedConvId ? 'flex' : 'hidden md:flex')}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-olive-100 bg-white">
            <button onClick={() => { setSelectedConvId(null); setShowMembers(false); }} className="md:hidden p-1.5 rounded-xl hover:bg-olive-50">
              <ArrowLeft className="w-5 h-5 text-olive-600" />
            </button>
            {/* Avatar */}
            {isGroupConv ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-white" />
              </div>
            ) : (
              <img
                src={getAvatar(
                  getOtherParticipant(selectedConv, user!.id)?.profile?.avatarUrl,
                  getOtherParticipant(selectedConv, user!.id)?.username ?? '',
                )}
                alt={chatHeader.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            {/* Name */}
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 truncate">
                {chatHeader.name}
              </p>
              {isGroupConv ? (
                <p className="text-xs text-olive-400">
                  {selectedConv.participants.length} member{selectedConv.participants.length !== 1 ? 's' : ''}
                  {selectedConv.activity?.status === 'CANCELLED' && (
                    <span className="ml-2 px-1.5 py-0.5 bg-red-50 text-red-400 rounded-full text-[10px]">Activity cancelled</span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-olive-400">
                  @{getOtherParticipant(selectedConv, user!.id)?.username}
                </p>
              )}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1">
              {isGroupConv && (
                <button
                  onClick={() => setShowMembers((v) => !v)}
                  className={cn('p-2 rounded-xl hover:bg-olive-50 transition-colors', showMembers ? 'bg-olive-100 text-olive-700' : 'text-olive-500')}
                  title="View members"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 rounded-xl hover:bg-olive-50 text-olive-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Members panel */}
          {showMembers && isGroupConv && (
            <GroupMembersPanel
              conv={selectedConv}
              myId={user!.id}
              onDm={startDm}
              onClose={() => setShowMembers(false)}
            />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-olive-50">
            {messages.map((msg) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                  {!isMe && (
                    <img
                      src={getAvatar(msg.sender.profile?.avatarUrl, msg.sender.username)}
                      alt=""
                      className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end"
                    />
                  )}
                  <div className={cn(
                    'max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    isMe
                      ? 'bg-olive-500 text-white rounded-br-none'
                      : 'bg-white text-olive-800 rounded-bl-none shadow-card',
                  )}>
                    {/* Show sender name in group chats for other users' messages */}
                    {isGroupConv && !isMe && (
                      <p className="text-[10px] font-semibold text-olive-500 mb-1">
                        {msg.sender.profile?.displayName ?? msg.sender.username}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={cn('text-[10px] mt-1', isMe ? 'text-olive-200 text-right' : 'text-olive-400')}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                  {isMe && (
                    <img
                      src={getAvatar(user?.profile?.avatarUrl, user?.username ?? '')}
                      alt=""
                      className="w-7 h-7 rounded-full ml-2 flex-shrink-0 self-end"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-olive-100">
            <div className="flex items-center gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={
                  isGroupConv
                    ? `Message ${chatHeader.name}...`
                    : `Message ${getOtherParticipant(selectedConv, user!.id)?.profile?.displayName ?? getOtherParticipant(selectedConv, user!.id)?.username ?? ''}...`
                }
                className="input-field flex-1 py-3"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="w-11 h-11 bg-olive-500 rounded-2xl flex items-center justify-center text-white hover:bg-olive-600 transition-colors disabled:opacity-50 shadow-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-center p-8">
          <div className="text-7xl mb-4">💬</div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">
            Your Messages
          </h3>
          <p className="text-olive-500 text-sm">Select a conversation to start chatting</p>
          <p className="text-olive-400 text-xs mt-2">Join activities to access their group chats 👥</p>
        </div>
      )}
    </div>
  );
}
