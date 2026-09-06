import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays, Users, Star, TrendingUp, MapPin,
  ChevronRight, Plus, Bell, Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { activitiesApi } from '@/lib/api/activities.api';
import { usersApi } from '@/lib/api/users.api';
import { notificationsApi } from '@/lib/api/notifications.api';
import { ActivityCard } from '@/components/ActivityCard';
import type { Activity, UserProfile } from '@/lib/api/types';

function getDisplayName(user: UserProfile | null) {
  if (!user) return 'there';
  return user.profile?.displayName?.split(' ')[0] ?? user.username;
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const { data: recommendedActivities = [] } = useQuery({
    queryKey: ['recommendations', 'activities'],
    queryFn: activitiesApi.getRecommended,
  });

  const { data: recommendedPeople = [] } = useQuery({
    queryKey: ['recommendations', 'people'],
    queryFn: usersApi.getRecommended,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30_000,
  });

  const { data: recentActivitiesData } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: () => activitiesApi.getAll({ limit: 4, status: 'ACTIVE', timeline: 'upcoming' }),
  });

  const rep = profile?.reputationSummary;
  const statCards = [
    { label: 'Activities Joined', value: rep?.activitiesJoined ?? '–', icon: CalendarDays, color: 'bg-blue-50 text-blue-600' },
    { label: 'Connections', value: rep?.connectionsCount ?? '–', icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Activities Created', value: rep?.activitiesHosted ?? '–', icon: Star, color: 'bg-amber-50 text-amber-600' },
    { label: 'Level', value: rep ? `Lv.${rep.level} 🔥` : '–', icon: TrendingUp, color: 'bg-rose-50 text-rose-600' },
  ];

  const upcoming = recentActivitiesData?.items ?? [];
  const forYou = recommendedActivities.slice(0, 4);
  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="page-title">{greeting}, {getDisplayName(profile ?? user)}! 👋</h1>
          <p className="text-olive-500 mt-1">Here's what's happening around you.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/search" className="p-2.5 rounded-2xl bg-white border border-olive-100 shadow-card hover:shadow-card-hover hover:bg-olive-50 transition-all">
            <Search className="w-5 h-5 text-olive-600" />
          </Link>
          <Link to="/notifications" className="relative p-2.5 rounded-2xl bg-white border border-olive-100 shadow-card hover:shadow-card-hover hover:bg-olive-50 transition-all">
            <Bell className="w-5 h-5 text-olive-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-olive-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 hover:shadow-card-hover transition-shadow duration-200">
            <div className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-bold text-2xl text-olive-900" style={{ fontFamily: 'var(--font-poppins)' }}>{value}</p>
            <p className="text-xs text-olive-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Activities feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title text-xl">Upcoming Activities</h2>
              <Link to="/activities" className="btn-ghost text-xs">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {upcoming.map((a: Activity) => <ActivityCard key={a.id} activity={a} />)}
              </div>
            ) : (
              <div className="card p-8 text-center text-olive-400">
                <p>No upcoming activities yet. <Link to="/activities" className="text-olive-600 font-medium">Browse activities</Link></p>
              </div>
            )}
          </div>

          {/* Recommended */}
          {forYou.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title text-xl">Recommended for You ✨</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {forYou.map((a: Activity) => <ActivityCard key={a.id} activity={a} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar widgets */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="card p-5">
            <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/activities/create" className="btn-primary w-full text-sm py-3">
                <Plus className="w-4 h-4" /> Create Activity
              </Link>
              <Link to="/search" className="btn-secondary w-full text-sm py-3">
                <Search className="w-4 h-4" /> Discover People
              </Link>
            </div>
          </div>

          {/* People You May Know */}
          {recommendedPeople.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900">People You May Know</h3>
                <Link to="/people" className="text-xs text-olive-500 hover:text-olive-700">View all</Link>
              </div>
              <div className="space-y-3">
                {recommendedPeople.slice(0, 3).map((person: UserProfile) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={person.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`}
                        alt={person.profile?.displayName ?? person.username}
                        className="w-10 h-10 rounded-full ring-2 ring-olive-100"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-olive-900 truncate">{person.profile?.displayName ?? person.username}</p>
                      <p className="text-xs text-olive-500 truncate">@{person.username}{person.profile?.city ? ` · ${person.profile.city}` : ''}</p>
                    </div>
                    <Link
                      to={`/people/${person.username}`}
                      className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-xl bg-olive-100 text-olive-700 hover:bg-olive-200 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User card */}
          {(profile ?? user) && (
            <div className="card p-5 bg-gradient-to-br from-olive-500 to-olive-700 text-white">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={(profile ?? user)?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${(profile ?? user)?.username}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full ring-2 ring-white/30"
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold">{(profile ?? user)?.profile?.displayName ?? (profile ?? user)?.username}</p>
                  <p className="text-olive-200 text-xs">@{(profile ?? user)?.username}</p>
                </div>
              </div>
              {(profile ?? user)?.profile?.bio && (
                <p className="text-sm text-olive-100 mb-4">{(profile ?? user)?.profile?.bio}</p>
              )}
              <Link to="/profile/edit" className="w-full block text-center py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-semibold">
                Edit Profile
              </Link>
            </div>
          )}

          {/* Near You Component */}
          <NearYouSidebar city={(profile ?? user)?.profile?.city ?? undefined} />
        </div>
      </div>
    </div>
  );
}

function NearYouSidebar({ city }: { city?: string }) {
  const { data } = useQuery({
    queryKey: ['activities', 'near-you', city],
    queryFn: () => activitiesApi.getAll({ city, limit: 5 }),
  });

  const activities = data?.items ?? [];

  return (
    <div className="card p-5">
      <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 mb-3">
        Near You {city ? `in ${city}` : ''} 📍
      </h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-olive-500">No activities found nearby.</p>
        ) : (
          activities.map((a) => (
            <Link key={a.id} to={`/activities/${a.id}`} className="block p-3 rounded-xl hover:bg-olive-50 border border-transparent hover:border-olive-100 transition-colors">
              <p className="font-semibold text-olive-900 text-sm truncate">{a.title}</p>
              <div className="flex items-center justify-between mt-1 text-xs text-olive-500">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.city || 'Online'}</span>
                <span>{new Date(a.startTime).toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
      <Link to="/activities" className="block mt-4 text-center text-sm font-semibold text-olive-600 hover:text-olive-800">
        View Map & Explore →
      </Link>
    </div>
  );
}
