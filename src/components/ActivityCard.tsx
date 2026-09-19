import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Bookmark, Share2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities.api';
import type { Activity } from '@/lib/api/types';
import { getCoverImage } from '@/lib/getImage';

/** Reads the logged-in user's ID from the persisted Zustand auth store. */
function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

interface ActivityCardProps {
  activity: Activity;
  variant?: 'grid' | 'list';
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'TBD';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getHostName(activity: Activity) {
  // Backend returns `creator` in list responses; `host` is the legacy alias
  const user = activity.creator || activity.host;
  return user?.profile?.displayName ?? user?.username ?? 'Unknown';
}

function getHostAvatar(activity: Activity) {
  const user = activity.creator || activity.host;
  return user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
}

// The backend has no top-level `category` field — the category is stored as
// the first element of `tags[]` (set at creation time from CreateActivityDto.category).
function getCategory(activity: Activity): string | undefined {
  return activity.category || activity.tags?.[0] || undefined;
}


export function ActivityCard({ activity, variant = 'grid' }: ActivityCardProps) {
  const [joined, setJoined] = useState(activity.isJoined ?? false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (activity.isJoined !== undefined) {
      setJoined(activity.isJoined);
    }
  }, [activity.isJoined]);

  // ── Relationship detection ────────────────────────────────────────────────
  const currentUserId = getCurrentUserId();
  const hostId = activity.creator?.id ?? activity.host?.id;
  /** True when the logged-in user created / hosts this activity */
  const isHosted = !!(currentUserId && hostId && currentUserId === hostId);
  /** True when the user has joined but did NOT host */
  const isJoined = !isHosted && joined;

  const attendees = activity._count?.participants ?? 0;
  const capacity = activity.maxParticipants;
  const fillPercent = capacity > 0 ? Math.min(Math.round((attendees / capacity) * 100), 100) : 0;

  /** True when the event has already happened */
  const isPast =
    activity.status === 'COMPLETED' ||
    activity.status === 'EXPIRED' ||
    !!(activity.scheduledAt && new Date(activity.scheduledAt) < new Date()) ||
    !!(activity.startTime && new Date(activity.startTime) < new Date());

  const joinMutation = useMutation({
    mutationFn: () => (joined ? activitiesApi.leave(activity.id) : activitiesApi.join(activity.id)),
    onSuccess: () => {
      setJoined(!joined);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const groupChatId = activity.groupConversation?.id;

  if (variant === 'list') {
    return (
      <Link to={`/activities/${activity.id}`} className="card-hover flex gap-4 p-4 animate-fade-in">
        <img src={getCoverImage(activity.coverImageUrl ?? activity.coverUrl, getCategory(activity))} alt={activity.title} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="badge-olive mb-1">{getCategory(activity)}</span>
              <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 text-base leading-snug">{activity.title}</h3>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
              className="flex-shrink-0 p-1.5 rounded-xl hover:bg-olive-50 transition-colors"
            >
              <Bookmark className={cn('w-4 h-4', saved ? 'fill-olive-500 text-olive-500' : 'text-olive-400')} />
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-olive-500">
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(activity.scheduledAt ?? activity.startTime)}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.address}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{attendees}/{capacity}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-olive-600">
              {activity.isFree !== false ? '🟢 Free' : `💰 ₹${activity.price}`}
            </span>
            {isHosted ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-100 text-blue-700">
                🎯 Hosted by you
              </span>
            ) : isJoined ? (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-700">
                ✓ Already Joined
              </span>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); joinMutation.mutate(); }}
                disabled={joinMutation.isPending}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                  joined
                    ? 'bg-olive-100 text-olive-700 hover:bg-red-50 hover:text-red-600'
                    : 'bg-olive-500 text-white hover:bg-olive-600'
                )}
              >
                {joined ? 'Joined ✓' : 'Join'}
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card-hover group overflow-hidden animate-fade-in">
      {/* Image */}
      <Link to={`/activities/${activity.id}`}>
        <div className="relative h-40 overflow-hidden rounded-t-3xl">
          <img
            src={getCoverImage(activity.coverImageUrl ?? activity.coverUrl, getCategory(activity))}
            alt={activity.title}
            className={cn('w-full h-full object-cover transition-transform duration-500 group-hover:scale-110', isPast && 'grayscale-[50%]')}
          />
          <div className={cn('absolute inset-0 bg-gradient-to-t from-black/40 to-transparent', isPast && 'bg-black/30')} />
          <span className="absolute top-3 left-3 badge bg-white/90 text-olive-700 backdrop-blur-sm">
            {getCategory(activity)}
          </span>
          {isPast ? (
            <span className="absolute top-3 right-3 badge bg-gray-700/90 text-white">Ended</span>
          ) : (
            <span className="absolute top-3 right-3 badge bg-olive-500 text-white">
              {activity.isFree !== false ? 'Free' : `₹${activity.price}`}
            </span>
          )}

          {/* ── Status pill on cover image (bottom-left) ── */}
          {isHosted && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/90 text-white backdrop-blur-sm shadow">
              🎯 Hosted by you
            </span>
          )}
          {isJoined && !isPast && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-sm shadow">
              ✓ Already Joined
            </span>
          )}

          <button
            onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
            className="absolute bottom-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Bookmark className={cn('w-3.5 h-3.5', saved ? 'fill-olive-500 text-olive-500' : 'text-olive-500')} />
          </button>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4">
        <Link to={`/activities/${activity.id}`}>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 text-base leading-snug mb-2 line-clamp-1 hover:text-olive-600 transition-colors">
            {activity.title}
          </h3>
        </Link>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-olive-500">
            <CalendarDays className="w-3.5 h-3.5 text-olive-400" />
            <span>{formatDate(activity.scheduledAt ?? activity.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-olive-500">
            <MapPin className="w-3.5 h-3.5 text-olive-400" />
            <span className="truncate">{activity.address}, {activity.city}</span>
          </div>
        </div>

        {/* Host */}
        <div className="flex items-center gap-2 mb-3">
          <img src={getHostAvatar(activity)} alt={getHostName(activity)} className="w-5 h-5 rounded-full" />
          <span className="text-xs text-olive-500">by <span className="font-medium text-olive-700">{getHostName(activity)}</span></span>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-olive-500 mb-1">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{attendees} going</span>
            <span>{fillPercent}% full</span>
          </div>
          <div className="h-1.5 bg-olive-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', fillPercent > 80 ? 'bg-amber-400' : 'bg-olive-500')}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* ── Action button area ── */}
        <div className="flex gap-2">
          {isPast ? (
            /* Gray — past/ended activity */
            <Link
              to={`/activities/${activity.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              📅 View Past Activity
            </Link>
          ) : isHosted ? (
            /* Blue — creator view */
            <Link
              to={`/activities/${activity.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              🎯 Manage Activity
            </Link>
          ) : isJoined ? (
            /* Teal/Emerald — already joined */
            groupChatId ? (
              <Link
                to={`/chat/${groupChatId}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
              >
                💬 Start Group Chat
              </Link>
            ) : (
              <Link
                to={`/activities/${activity.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
              >
                <CheckCircle className="w-4 h-4" /> Already Joined
              </Link>
            )
          ) : (
            /* Default — join */
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60',
                joined
                  ? 'bg-olive-100 text-olive-700 hover:bg-red-50 hover:text-red-600'
                  : 'bg-olive-500 text-white hover:bg-olive-600 shadow-btn'
              )}
            >
              {joined && <CheckCircle className="w-4 h-4" />}
              {joinMutation.isPending ? '...' : joined ? 'Joined' : 'Join Activity'}
            </button>
          )}
          <button className="p-2 rounded-xl border border-olive-200 hover:bg-olive-50 transition-colors">
            <Share2 className="w-4 h-4 text-olive-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
