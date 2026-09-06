import { Link } from 'react-router-dom';
import { MapPin, UserCheck, UserPlus, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { connectionsApi } from '@/lib/api/connections.api';
import type { UserProfile } from '@/lib/api/types';

function getDisplayName(person: UserProfile) {
  return person.profile?.displayName ?? person.username;
}

function getAvatar(person: UserProfile) {
  return person.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`;
}

export function PersonCard({ person }: { person: UserProfile }) {
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: () =>
      connected
        ? connectionsApi.remove(person.id) // optimistic: use person.id as connectionId placeholder
        : connectionsApi.send(person.id),
    onSuccess: () => {
      setConnected(!connected);
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'people'] });
    },
  });

  return (
    <div className="card-hover p-5 flex flex-col items-center text-center animate-scale-in">
      <div className="relative mb-3">
        <img
          src={getAvatar(person)}
          alt={getDisplayName(person)}
          className="w-16 h-16 rounded-full ring-2 ring-olive-200"
        />
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
      </div>

      <Link
        to={`/people/${person.username}`}
        style={{ fontFamily: 'var(--font-poppins)' }}
        className="font-semibold text-olive-900 hover:text-olive-600 transition-colors"
      >
        {getDisplayName(person)}
      </Link>
      <p className="text-xs text-olive-500 mt-0.5 mb-1">@{person.username}</p>

      {person.profile?.city && (
        <div className="flex items-center gap-1 text-xs text-olive-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{person.profile.city}</span>
        </div>
      )}

      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60',
            connected
              ? 'bg-olive-100 text-olive-700 hover:bg-red-50 hover:text-red-500'
              : 'bg-olive-500 text-white hover:bg-olive-600 shadow-btn'
          )}
        >
          {connected ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
          {connected ? 'Connected' : 'Connect'}
        </button>
        <Link
          to="/messages"
          className="p-2 rounded-xl border border-olive-200 hover:bg-olive-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-olive-500" />
        </Link>
      </div>
    </div>
  );
}
