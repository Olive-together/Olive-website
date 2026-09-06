import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CalendarDays, Edit, Users, Star, Settings, Share2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api/users.api';
import { activitiesApi } from '@/lib/api/activities.api';
import { getCoverImage } from '@/lib/getImage';

export function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user);

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
    initialData: storeUser ?? undefined,
  });

  const { data: joinedActivities } = useQuery({
    queryKey: ['activities', { status: 'ACTIVE' }],
    queryFn: () => activitiesApi.getAll({ status: 'ACTIVE' }),
  });

  const user = profile ?? storeUser;
  const rep = (profile as typeof profile)?.reputationSummary;
  const displayName = user?.profile?.displayName ?? user?.username ?? 'User';
  const avatar = user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Cover + avatar */}
      <div className="relative">
        <div className="h-40 sm:h-56 bg-gradient-to-br from-olive-400 to-olive-700 rounded-b-3xl overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl opacity-20">🌿</div>
          </div>
        </div>

        <div className="px-4 sm:px-8">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className="w-24 h-24 rounded-3xl ring-4 ring-white shadow-card-hover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex gap-2 mb-2">
              <button className="p-2 rounded-xl border border-olive-200 bg-white hover:bg-olive-50 transition-colors">
                <Share2 className="w-4 h-4 text-olive-600" />
              </button>
              <Link to="/settings" className="p-2 rounded-xl border border-olive-200 bg-white hover:bg-olive-50 transition-colors">
                <Settings className="w-4 h-4 text-olive-600" />
              </Link>
              <Link to="/profile/edit" className="btn-primary text-sm px-4 py-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
          </div>

          {/* Name + meta */}
          <div className="mb-5">
            <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900">{displayName}</h1>
            <p className="text-olive-500 text-sm">@{user?.username}</p>
            {user?.profile?.bio && <p className="text-olive-700 mt-2">{user.profile.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-olive-500">
              {user?.profile?.city && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.profile.city}</span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Joined {new Date(user?.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {(user?.userInterests && user.userInterests.length > 0) || (user?.userSkills && user.userSkills.length > 0) ? (
              <div className="mt-5 space-y-4">
                {user?.userInterests && user.userInterests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.userInterests.map((ui: any) => (
                        <span key={ui.interest.name} className="px-3 py-1 bg-olive-100 text-olive-700 text-sm rounded-full">
                          {ui.interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user?.userSkills && user.userSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-olive-400 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {user.userSkills.map((us: any) => (
                        <span key={us.skill.name} className="px-3 py-1 bg-olive-100 text-olive-700 text-sm rounded-full border border-olive-200">
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
              { label: 'Activities Joined', value: rep?.activitiesJoined ?? 0, icon: CalendarDays },
              { label: 'Connections', value: rep?.connectionsCount ?? 0, icon: Users },
              { label: 'Activities Created', value: rep?.activitiesHosted ?? 0, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card p-4 text-center">
                <Icon className="w-5 h-5 text-olive-500 mx-auto mb-1" />
                <p style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900">{value}</p>
                <p className="text-xs text-olive-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Activities */}
          {joinedActivities?.items && joinedActivities.items.length > 0 && (
            <div className="mb-8">
              <h3 className="section-title text-xl mb-4">Activities</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {joinedActivities.items.slice(0, 4).map((activity) => (
                  <Link key={activity.id} to={`/activities/${activity.id}`} className="card-hover flex gap-3 p-4">
                    <img
                      src={getCoverImage(activity.coverImageUrl, activity.category)}
                      alt={activity.title}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-olive-900 text-sm truncate">{activity.title}</h4>
                      <p className="text-xs text-olive-500 mt-0.5">{new Date(activity.startTime).toLocaleDateString()}</p>
                      <p className="text-xs text-olive-500">{activity.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
