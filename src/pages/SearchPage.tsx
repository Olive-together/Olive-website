import { useState } from 'react';
import { Search, X, CalendarDays, Users, MapPin, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchApi } from '@/lib/api/search.api';
import { activitiesApi } from '@/lib/api/activities.api';
import { useDebouncedValue } from '@/lib/useDebounce';
import { getCoverImage } from '@/lib/getImage';

type TabType = 'all' | 'activities' | 'people';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabType>('all');
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const { data: popularActivities } = useQuery({
    queryKey: ['activities', { status: 'ACTIVE' }],
    queryFn: () => activitiesApi.getAll({ status: 'ACTIVE', limit: 3 }),
  });

  const activityResults = searchResults?.activities ?? [];
  const peopleResults = searchResults?.users ?? [];
  const totalResults = activityResults.length + peopleResults.length;

  const suggestions = ['Music', 'Sports', 'Art', 'Food', 'Technology', 'Outdoors', 'Education', 'Social', 'Fitness', 'Gaming', 'Business'];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full animate-fade-in">
      <h1 className="page-title mb-6">Search 🔍</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-olive-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search activities, people, skills..."
          className="input-field pl-14 pr-12 py-5 text-lg"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5 text-olive-400 hover:text-olive-600" />
          </button>
        )}
      </div>

      {!debouncedQuery || debouncedQuery.length < 2 ? (
        /* Suggestions + popular */
        <div>
          <p className="text-sm font-semibold text-olive-700 mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {suggestions.map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="tag px-4 py-2 text-sm">
                {s}
              </button>
            ))}
          </div>

          {popularActivities?.items && popularActivities.items.length > 0 && (
            <>
              <p className="text-sm font-semibold text-olive-700 mb-3">Popular Activities</p>
              <div className="space-y-3">
                {popularActivities.items.map((a) => (
                  <Link key={a.id} to={`/activities/${a.id}`} className="card-hover flex items-center gap-4 p-4">
                    <img
                      src={getCoverImage(a.coverImageUrl, a.category)}
                      alt={a.title}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-olive-900">{a.title}</p>
                      <p className="text-sm text-olive-500">{new Date(a.startTime).toLocaleDateString()} · {a.city}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-olive-400 ml-auto" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-olive-50" />
          ))}
        </div>
      ) : (
        /* Results */
        <div>
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {(['all', 'activities', 'people'] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  tab === t ? 'bg-olive-500 text-white shadow-btn' : 'bg-white border border-olive-100 text-olive-600'
                }`}
              >
                {t} {t === 'all' ? `(${totalResults})` : t === 'activities' ? `(${activityResults.length})` : `(${peopleResults.length})`}
              </button>
            ))}
          </div>

          {totalResults === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">No results for "{query}"</h3>
              <p className="text-olive-500 text-sm">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Activities */}
              {(tab === 'all' || tab === 'activities') && activityResults.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-800 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-olive-500" />
                    Activities ({activityResults.length})
                  </h2>
                  <div className="space-y-3">
                    {activityResults.map((a) => (
                      <Link key={a.id} to={`/activities/${a.id}`} className="card-hover flex items-center gap-4 p-4">
                        <img
                          src={getCoverImage(a.coverImageUrl, a.category)}
                          alt={a.title}
                          className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-olive-900 truncate">{a.title}</p>
                          <div className="flex gap-3 text-xs text-olive-500 mt-0.5">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(a.startTime).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.city}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{a._count?.participants ?? 0}</span>
                          </div>
                        </div>
                        <span className="badge-olive text-xs">{a.category}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* People */}
              {(tab === 'all' || tab === 'people') && peopleResults.length > 0 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-olive-500" />
                    People ({peopleResults.length})
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {peopleResults.map((p) => (
                      <Link key={p.id} to={`/people/${p.username}`} className="card-hover flex items-center gap-3 p-4">
                        <img
                          src={p.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`}
                          alt={p.profile?.displayName ?? p.username}
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-olive-900 truncate">{p.profile?.displayName ?? p.username}</p>
                          <p className="text-xs text-olive-500">@{p.username}{p.profile?.city ? ` · ${p.profile.city}` : ''}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
