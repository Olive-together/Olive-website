import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Bookmark, Share2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities.api';
import type { Activity } from '@/lib/api/types';
import { getCoverImage } from '@/lib/getImage';

interface ActivityCardProps {
  activity: Activity;
  variant?: 'grid' | 'list';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getHostName(activity: Activity) {
  // Try creator (Prisma schema) or host (if mapped)
  const user = (activity as any).creator || activity.host;
  return user?.profile?.displayName ?? user?.username ?? 'Unknown';
}

function getHostAvatar(activity: Activity) {
  const user = (activity as any).creator || activity.host;
  return user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;
}



export function ActivityCard({ activity, variant = 'grid' }: ActivityCardProps) {
  const [joined, setJoined] = useState(activity.isJoined ?? false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const attendees = activity._count?.participants ?? 0;
  const capacity = activity.maxParticipants;
  const fillPercent = capacity > 0 ? Math.min(Math.round((attendees / capacity) * 100), 100) : 0;

  const joinMutation = useMutation({
    mutationFn: () => (joined ? activitiesApi.leave(activity.id) : activitiesApi.join(activity.id)),
    onSuccess: () => {
      setJoined(!joined);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  if (variant === 'list') {
    return (
      <Link to={`/activities/${activity.id}`} className="card-hover flex gap-4 p-4 animate-fade-in">
        <img src={getCoverImage(activity.coverImageUrl, activity.category)} alt={activity.title} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="badge-olive mb-1">{activity.category}</span>
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
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{((activity as any).scheduledAt || activity.startTime) ? formatDate((activity as any).scheduledAt || activity.startTime) : 'TBD'}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.address}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{attendees}/{capacity}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-olive-600">
              {activity.isFree !== false ? '🟢 Free' : `💰 ₹${activity.price}`}
            </span>
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
            src={getCoverImage(activity.coverImageUrl, activity.category)}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute top-3 left-3 badge bg-white/90 text-olive-700 backdrop-blur-sm">
            {activity.category}
          </span>
          <span className="absolute top-3 right-3 badge bg-olive-500 text-white">
            {activity.isFree !== false ? 'Free' : `₹${activity.price}`}
          </span>
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
            <span>{((activity as any).scheduledAt || activity.startTime) ? formatDate((activity as any).scheduledAt || activity.startTime) : 'TBD'}</span>
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

        {/* Actions */}
        <div className="flex gap-2">
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
          <button className="p-2 rounded-xl border border-olive-200 hover:bg-olive-50 transition-colors">
            <Share2 className="w-4 h-4 text-olive-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
