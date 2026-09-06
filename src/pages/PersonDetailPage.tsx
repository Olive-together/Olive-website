import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, MessageCircle, UserPlus, UserCheck, CalendarDays, Star } from 'lucide-react';
import { usersApi } from '@/lib/api/users.api';
import { activitiesApi } from '@/lib/api/activities.api';
import { connectionsApi } from '@/lib/api/connections.api';
import { useState } from 'react';
import { chatApi } from '@/lib/api/chat.api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import { getCoverImage } from '@/lib/getImage';

function getAvatar(avatarUrl: string | null, username: string) {
  return avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
}

export function PersonDetailPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: person, isLoading, isError } = useQuery({
    queryKey: ['users', username],
    queryFn: () => usersApi.getByUsername(username!),
    enabled: !!username,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.getAll({ limit: 4 }),
  });

  const { data: allConnections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: connectionsApi.getAll,
  });

  const { data: pendingConnections = [] } = useQuery({
    queryKey: ['connections', 'pending'],
    queryFn: connectionsApi.getPending,
  });

  const myId = useAuthStore((s) => s.user?.id);

  const isConnected = person ? allConnections.some((c: any) => c.fromUser?.id === person.id || c.toUser?.id === person.id) : false;
  const pendingConn = person ? pendingConnections.find((c: any) => c.fromUser?.id === person.id || c.toUser?.id === person.id) : null;
  const isPendingReceived = pendingConn && pendingConn.toUser?.id === myId;
  const isPendingSent = pendingConn && pendingConn.fromUser?.id === myId;
  const connectionStatus = isConnected ? 'CONNECTED' : isPendingReceived ? 'RECEIVED' : isPendingSent ? 'SENT' : 'NONE';

  const connectMutation = useMutation({
    mutationFn: () => {
      if (connectionStatus === 'CONNECTED' || connectionStatus === 'SENT' || connectionStatus === 'RECEIVED') {
        return Promise.resolve(null as any); // Do nothing
      }
      return connectionsApi.send(person!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['connections'] });
      }
    }
  });

  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) => connectionsApi.accept(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => chatApi.createConversation(person!.id),
    onSuccess: (conversation) => {
      navigate('/messages', { state: { conversationId: conversation.id } });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 animate-fade-in">
        <div className="h-52 rounded-b-3xl bg-olive-100 animate-pulse mb-6" />
        <div className="space-y-4 px-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-olive-50" />)}
        </div>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <div className="text-6xl mb-4">👋</div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">User not found</h3>
          <Link to="/people" className="btn-primary text-sm mt-4">Browse People</Link>
        </div>
      </div>
    );
  }

  const displayName = person.profile?.displayName ?? person.username;
  const avatar = getAvatar(person.profile?.avatarUrl ?? null, person.username);
  const rep = person.reputationSummary;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Cover */}
      <div className="h-40 sm:h-52 bg-gradient-to-br from-olive-300 to-olive-600 relative rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
      </div>

      <div className="px-4 sm:px-8 pb-8">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between -mt-12 mb-5">
          <div className="relative">
            <img src={avatar} alt={displayName} className="w-24 h-24 rounded-3xl ring-4 ring-white shadow-card-hover" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex gap-2 mb-1">
            <button 
              onClick={() => messageMutation.mutate()}
              disabled={messageMutation.isPending}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" /> Message
            </button>
            {connectionStatus === 'RECEIVED' ? (
              <button
                onClick={() => acceptMutation.mutate(pendingConn!.id)}
                disabled={acceptMutation.isPending}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 rounded-2xl font-semibold transition-all disabled:opacity-60"
              >
                <UserCheck className="w-4 h-4" /> Accept
              </button>
            ) : (
              <button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending || connectionStatus !== 'NONE'}
                className={cn('text-sm py-2 px-4 flex items-center gap-1.5 rounded-2xl font-semibold transition-all disabled:opacity-60', connectionStatus !== 'NONE' ? 'btn-secondary' : 'btn-primary')}
              >
                {connectionStatus === 'CONNECTED' ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {connectionStatus === 'CONNECTED' ? 'Connected' : connectionStatus === 'SENT' ? 'Pending' : 'Connect'}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mb-6">
          <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900">{displayName}</h1>
          <p className="text-olive-500 text-sm">@{person.username}</p>
          {person.profile?.bio && <p className="text-olive-700 font-medium mt-1">{person.profile.bio}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-olive-500">
            {person.profile?.city && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{person.profile.city}</span>
            )}
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />Level {rep?.level ?? 1}</span>
          </div>

          {(person.userInterests && person.userInterests.length > 0) || (person.userSkills && person.userSkills.length > 0) ? (
            <div className="mt-4 space-y-3">
              {person.userInterests && person.userInterests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {person.userInterests.map((ui: any) => (
                      <span key={ui.interest.name} className="px-2.5 py-1 bg-olive-100 text-olive-700 text-xs rounded-full">
                        {ui.interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {person.userSkills && person.userSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {person.userSkills.map((us: any) => (
                      <span key={us.skill.name} className="px-2.5 py-1 bg-olive-100 text-olive-700 text-xs rounded-full border border-olive-200">
                        {us.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Activities', value: rep?.activitiesJoined ?? 0 },
            { label: 'Connections', value: rep?.connectionsCount ?? 0 },
            { label: 'Points', value: rep?.totalPoints ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900">{value}</p>
              <p className="text-xs text-olive-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent activities */}
        {activitiesData?.items && activitiesData.items.length > 0 && (
          <div>
            <h3 className="section-title text-xl mb-4">Recent Activities</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {activitiesData.items.slice(0, 4).map((a) => (
                <Link key={a.id} to={`/activities/${a.id}`} className="card-hover flex gap-3 p-4">
                  <img
                    src={getCoverImage(a.coverImageUrl, a.category)}
                    alt={a.title}
                    className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-olive-900 text-sm truncate">{a.title}</p>
                    <p className="text-xs text-olive-500 mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(a.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
