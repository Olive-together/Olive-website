import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays, MapPin, Users, ArrowLeft, Share2,
  Bookmark, CheckCircle, Clock, Tag, Star, MessageSquare,
} from 'lucide-react';
import { activitiesApi } from '@/lib/api/activities.api';
import { chatApi } from '@/lib/api/chat.api';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { getCoverImage } from '@/lib/getImage';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}



function getAvatar(avatarUrl: string | null, username: string) {
  return avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => activitiesApi.getById(id!),
    enabled: !!id,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['activities', id, 'participants'],
    queryFn: () => activitiesApi.getParticipants(id!),
    enabled: !!id,
  });

  const [joined, setJoined] = useState(false);
  // Sync joined state once activity loads
  useState(() => {
    if (activity?.isJoined !== undefined) setJoined(activity.isJoined);
  });

  const joinMutation = useMutation({
    mutationFn: () => (joined ? activitiesApi.leave(id!) : activitiesApi.join(id!)),
    onSuccess: () => {
      setJoined(!joined);
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
  });

  const openGroupChat = async () => {
    try {
      // Use the conv id from the activity response if available, otherwise fetch it
      const convId = (activity as any)?.groupConversation?.id;
      if (convId) {
        navigate('/messages', { state: { conversationId: convId } });
      } else {
        const conv = await chatApi.getActivityChat(id!);
        navigate('/messages', { state: { conversationId: conv.id } });
      }
    } catch {
      // Fallback: navigate to messages and let user select
      navigate('/messages');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 animate-fade-in">
        <div className="h-64 rounded-3xl bg-olive-100 animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-olive-50" />)}
          </div>
          <div className="card h-64 animate-pulse bg-olive-50" />
        </div>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">🌿</div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">Activity not found</h3>
          <Link to="/activities" className="btn-primary text-sm mt-4">Browse Activities</Link>
        </div>
      </div>
    );
  }

  const attendees = activity._count?.participants ?? 0;
  const capacity = activity.maxParticipants;
  const fillPercent = capacity > 0 ? Math.min(Math.round((attendees / capacity) * 100), 100) : 0;
  const host = (activity as any).creator || activity.host;
  const hostName = host?.profile?.displayName ?? host?.username;
  const hostAvatar = getAvatar(host?.profile?.avatarUrl ?? null, host?.username ?? '');
  
  const startTime = (activity as any).scheduledAt || activity.startTime;
  const endTime = (activity as any).endsAt || activity.endTime;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full animate-fade-in">
      {/* Back */}
      <div className="p-4 sm:p-6">
        <Link to="/activities" className="inline-flex items-center gap-2 text-sm text-olive-600 hover:text-olive-800 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </Link>
      </div>

      {/* Hero image */}
      <div className="relative h-56 sm:h-80 overflow-hidden mx-4 sm:mx-6 rounded-3xl mb-6">
        <img src={getCoverImage(activity.coverImageUrl, activity.category)} alt={activity.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5">
          <span className="badge bg-white/90 text-olive-700 mb-2">{activity.category}</span>
          <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-3xl text-white">{activity.title}</h1>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setSaved(!saved)} className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Bookmark className={cn('w-4 h-4', saved ? 'fill-olive-500 text-olive-500' : 'text-olive-600')} />
          </button>
          <button className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Share2 className="w-4 h-4 text-olive-600" />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8 grid lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info chips */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <CalendarDays className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{startTime ? formatDate(startTime) : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <MapPin className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{activity.address}, {activity.city}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
              <Users className="w-4 h-4 text-olive-500" />
              <span className="text-sm text-olive-700 font-medium">{attendees}/{capacity} attending</span>
            </div>
            {endTime && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-olive-100 shadow-card">
                <Clock className="w-4 h-4 text-olive-500" />
                <span className="text-sm text-olive-700 font-medium">Ends {formatDate(endTime)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-3">About this Activity</h2>
            <p className="text-olive-600 leading-relaxed">{activity.description}</p>
          </div>

          {/* Tags */}
          {activity.tags.length > 0 && (
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h2>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Attendees preview */}
          {participants.length > 0 && (
            <div className="card p-6">
              <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Who's going</h2>
              <div className="flex flex-wrap gap-3">
                {participants.slice(0, 6).map((person) => (
                  <Link key={person.id} to={`/people/${person.username}`} className="flex flex-col items-center gap-1.5 group">
                    <img
                      src={person.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`}
                      alt={person.profile?.displayName ?? person.username}
                      className="w-12 h-12 rounded-full ring-2 ring-olive-100 group-hover:ring-olive-400 transition-all"
                    />
                    <span className="text-xs text-olive-600 font-medium">{(person.profile?.displayName ?? person.username).split(' ')[0]}</span>
                  </Link>
                ))}
                {attendees > 6 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-full bg-olive-100 flex items-center justify-center border-2 border-dashed border-olive-300">
                      <span className="text-xs font-bold text-olive-600">+{attendees - 6}</span>
                    </div>
                    <span className="text-xs text-olive-500">more</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Action card */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-4">
            {/* Host */}
            <div className="flex items-center gap-3 mb-5">
              <img src={hostAvatar} alt={hostName} className="w-12 h-12 rounded-full ring-2 ring-olive-200" />
              <div>
                <p className="text-xs text-olive-500">Hosted by</p>
                <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900">{hostName}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-olive-500">Verified host</span>
                </div>
              </div>
            </div>

            <div className="bg-olive-50 rounded-2xl p-4 mb-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-olive-600">{attendees} attending</span>
                <span className="text-olive-600 font-medium">{fillPercent}% full</span>
              </div>
              <div className="h-2 bg-olive-200 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-500', fillPercent > 80 ? 'bg-amber-400' : 'bg-olive-500')} style={{ width: `${fillPercent}%` }} />
              </div>
              <p className="text-xs text-olive-500 mt-2">{capacity - attendees} spots remaining</p>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-lg text-olive-900">
                {activity.isFree !== false ? '🟢 Free' : `₹${activity.price}`}
              </span>
            </div>

            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 disabled:opacity-60',
                joined
                  ? 'bg-olive-100 text-olive-700 hover:bg-red-50 hover:text-red-600'
                  : 'bg-olive-500 text-white hover:bg-olive-600 shadow-btn'
              )}
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {joined && <CheckCircle className="w-5 h-5" />}
              {joinMutation.isPending ? 'Processing...' : joined ? "You're Going! ✓" : 'Join Activity'}
            </button>

            {/* Group Chat button — only shown to participants */}
            {joined && (
              <button
                onClick={openGroupChat}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-olive-50 border border-olive-200 text-olive-700 font-semibold text-sm hover:bg-olive-100 transition-all duration-200 group"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <MessageSquare className="w-4 h-4 text-olive-500 group-hover:text-olive-700 transition-colors" />
                Group Chat
              </button>
            )}

            <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl border border-olive-200 text-olive-600 font-medium text-sm hover:bg-olive-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share with Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
