import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Calendar, MessageCircle, UserPlus, Sparkles } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications.api';
import { cn } from '@/lib/cn';

const iconMap: Record<string, React.ReactNode> = {
  ACTIVITY_JOINED: <Calendar className="w-4 h-4" />,
  ACTIVITY_REMINDER: <Calendar className="w-4 h-4" />,
  CONNECTION_REQUEST: <UserPlus className="w-4 h-4" />,
  CONNECTION_ACCEPTED: <UserPlus className="w-4 h-4" />,
  NEW_MESSAGE: <MessageCircle className="w-4 h-4" />,
  RECOMMENDATION: <Sparkles className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
  ACTIVITY_JOINED: 'bg-blue-100 text-blue-600',
  ACTIVITY_REMINDER: 'bg-blue-100 text-blue-600',
  CONNECTION_REQUEST: 'bg-purple-100 text-purple-600',
  CONNECTION_ACCEPTED: 'bg-purple-100 text-purple-600',
  NEW_MESSAGE: 'bg-green-100 text-green-600',
  RECOMMENDATION: 'bg-amber-100 text-amber-600',
};

function getIcon(type: string) {
  return iconMap[type] ?? <Sparkles className="w-4 h-4" />;
}

function getColor(type: string) {
  return colorMap[type] ?? 'bg-olive-100 text-olive-600';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const filtered = filter === 'unread' ? notifications.filter((n: any) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title mb-1">Notifications 🔔</h1>
          <p className="text-olive-500">
            {unreadCount > 0 ? <><span className="font-semibold text-olive-700">{unreadCount}</span> unread notifications</> : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-ghost text-sm"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 capitalize',
              filter === tab ? 'bg-olive-500 text-white shadow-btn' : 'bg-white border border-olive-100 text-olive-600 hover:border-olive-300'
            )}
          >
            {tab} {tab === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-olive-50" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
              className={cn(
                'card p-4 cursor-pointer hover:shadow-card-hover transition-all duration-200 flex items-start gap-4',
                !notif.isRead && 'border-l-4 border-l-olive-500 bg-olive-50/50'
              )}
            >
              <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', getColor(notif.type))}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 text-sm">{notif.title}</p>
                  <span className="text-xs text-olive-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                </div>
                <p className="text-sm text-olive-600 mt-0.5">{notif.body}</p>
              </div>
              {!notif.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(notif.id); }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-olive-100 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5 text-olive-500" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-olive-200 mx-auto mb-4" />
            <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">
              {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            </h3>
            <p className="text-olive-500 text-sm">
              {filter === 'unread' ? 'No unread notifications.' : "Notifications will appear here when there's activity."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
