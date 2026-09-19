import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Calendar, MessageCircle, UserPlus, Sparkles, Star, Activity } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications.api';
import { useNotifPrefsStore } from '@/store/notifPrefsStore';
import { cn } from '@/lib/cn';
import type { NotificationPrefs } from '@/store/notifPrefsStore';

// Map backend NotificationType values → icon
const iconMap: Record<string, React.ReactNode> = {
  ACTIVITY_JOIN:      <Activity className="w-4 h-4" />,
  ACTIVITY_REQUEST:   <Activity className="w-4 h-4" />,
  ACTIVITY_ACCEPTED:  <Activity className="w-4 h-4" />,
  ACTIVITY_REJECTED:  <Activity className="w-4 h-4" />,
  ACTIVITY_INVITE:    <Activity className="w-4 h-4" />,
  ACTIVITY_CANCELLED: <Activity className="w-4 h-4" />,
  ACTIVITY_REMINDER:  <Calendar className="w-4 h-4" />,
  CONNECTION_REQUEST: <UserPlus className="w-4 h-4" />,
  CONNECTION_ACCEPTED:<UserPlus className="w-4 h-4" />,
  MESSAGE_NEW:        <MessageCircle className="w-4 h-4" />,
  MATCH_SUGGESTION:   <Sparkles className="w-4 h-4" />,
  RATING_RECEIVED:    <Star className="w-4 h-4" />,
  SYSTEM:             <Bell className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
  ACTIVITY_JOIN:      'bg-blue-100 text-blue-600',
  ACTIVITY_REQUEST:   'bg-blue-100 text-blue-600',
  ACTIVITY_ACCEPTED:  'bg-green-100 text-green-600',
  ACTIVITY_REJECTED:  'bg-red-100 text-red-500',
  ACTIVITY_INVITE:    'bg-blue-100 text-blue-600',
  ACTIVITY_CANCELLED: 'bg-red-100 text-red-500',
  ACTIVITY_REMINDER:  'bg-amber-100 text-amber-600',
  CONNECTION_REQUEST: 'bg-purple-100 text-purple-600',
  CONNECTION_ACCEPTED:'bg-purple-100 text-purple-600',
  MESSAGE_NEW:        'bg-green-100 text-green-600',
  MATCH_SUGGESTION:   'bg-amber-100 text-amber-600',
  RATING_RECEIVED:    'bg-yellow-100 text-yellow-600',
  SYSTEM:             'bg-olive-100 text-olive-600',
};

// Map backend NotificationType → pref key (null = always show)
const TYPE_TO_PREF: Record<string, keyof NotificationPrefs | null> = {
  ACTIVITY_JOIN:      'activityJoins',
  ACTIVITY_REQUEST:   'activityJoins',
  ACTIVITY_ACCEPTED:  'activityJoins',
  ACTIVITY_REJECTED:  'activityJoins',
  ACTIVITY_INVITE:    'activityJoins',
  ACTIVITY_CANCELLED: 'activityJoins',
  ACTIVITY_REMINDER:  'activityReminders',
  CONNECTION_REQUEST: 'connectionRequests',
  CONNECTION_ACCEPTED:'connectionRequests',
  MESSAGE_NEW:        'messages',
  MATCH_SUGGESTION:   'recommendations',
  RATING_RECEIVED:    'ratings',
  SYSTEM:             null,
};

function getIcon(type: string)  { return iconMap[type]  ?? <Bell className="w-4 h-4" />; }
function getColor(type: string) { return colorMap[type] ?? 'bg-olive-100 text-olive-600'; }

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
  const { prefs, loaded } = useNotifPrefsStore();

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

  // Frontend pref filter (secondary gate — backend is the primary gate)
  const visibleNotifications = loaded
    ? notifications.filter((n: any) => {
        const prefKey = TYPE_TO_PREF[n.type];
        if (prefKey === undefined) return true; // unknown type — show it
        if (prefKey === null) return true;       // SYSTEM — always show
        return prefs[prefKey];
      })
    : notifications;

  const filtered = filter === 'unread'
    ? visibleNotifications.filter((n: any) => !n.isRead)
    : visibleNotifications;

  const unreadCount = visibleNotifications.filter((n: any) => !n.isRead).length;


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
