import { useState, useRef, useEffect } from 'react';
import { Search, X, Users, CalendarDays, ArrowRight, MoreVertical, ShieldOff, Flag } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usersApi } from '@/lib/api/users.api';
import { blocksApi } from '@/lib/api/blocks.api';
import { useDebouncedValue } from '@/lib/useDebounce';
import type { ActivityConnectionPerson } from '@/lib/api/users.api';
import { BlockConfirmModal } from '@/components/BlockConfirmModal';
import { ReportUserModal } from '@/components/ReportUserModal';

function ActivityBadge({ status }: { status: string }) {
  const color =
    status === 'COMPLETED'
      ? 'bg-gray-100 text-gray-600'
      : status === 'ACTIVE'
      ? 'bg-green-50 text-green-700'
      : 'bg-olive-50 text-olive-600';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/** Small ⋮ menu on each person card for block/report */
function PersonCardMenu({ person }: { person: ActivityConnectionPerson }) {
  const [open, setOpen] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const displayName = person.profile?.displayName ?? person.username;

  const { data: blockStatus } = useQuery({
    queryKey: ['block-status', person.id],
    queryFn: () => blocksApi.getBlockStatus(person.id),
    staleTime: 60_000,
  });

  const isBlocked = blockStatus?.isBlocked ?? false;

  const blockMutation = useMutation({
    mutationFn: () =>
      isBlocked ? blocksApi.unblockUser(person.id) : blocksApi.blockUser(person.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-status', person.id] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
      setShowBlock(false);
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(p => !p); }}
          className="w-7 h-7 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="More actions"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {open && (
          <div
            className="absolute right-0 top-8 w-44 rounded-2xl shadow-xl overflow-hidden z-20 animate-scale-in"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              transformOrigin: 'top right',
            }}
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setShowBlock(true); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors text-left"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ShieldOff className="w-3.5 h-3.5 flex-shrink-0" />
              {isBlocked ? 'Unblock' : 'Block user'}
            </button>
            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setShowReport(true); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors text-left text-red-500"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Flag className="w-3.5 h-3.5 flex-shrink-0" />
              Report user
            </button>
          </div>
        )}
      </div>

      {showBlock && (
        <BlockConfirmModal
          displayName={displayName}
          isBlocked={isBlocked}
          isPending={blockMutation.isPending}
          onConfirm={() => blockMutation.mutate()}
          onClose={() => setShowBlock(false)}
        />
      )}
      {showReport && (
        <ReportUserModal
          userId={person.id}
          displayName={displayName}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}

function PersonMetCard({ person }: { person: ActivityConnectionPerson }) {
  const displayName = person.profile?.displayName ?? person.username;
  const avatar =
    person.profile?.avatarUrl ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}`;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 animate-scale-in flex flex-col">
      {/* Avatar + Name + Menu */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <img
            src={avatar}
            alt={displayName}
            className="w-12 h-12 rounded-2xl ring-2 ring-olive-100 object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/people/${person.username}`}
            style={{ fontFamily: 'var(--font-poppins)' }}
            className="font-semibold text-olive-900 hover:text-olive-600 transition-colors text-sm leading-tight truncate block"
          >
            {displayName}
          </Link>
          <p className="text-xs text-olive-400 mt-0.5 truncate">@{person.username}</p>
          {person.profile?.city && (
            <p className="text-xs text-olive-400 truncate">{person.profile.city}</p>
          )}
        </div>
        {/* ⋮ menu */}
        <PersonCardMenu person={person} />
      </div>

      {/* Shared activity count */}
      <div className="flex items-center gap-1.5 text-xs text-olive-500 mb-3">
        <CalendarDays className="w-3.5 h-3.5 text-olive-400 flex-shrink-0" />
        <span>
          <span className="font-semibold text-olive-700">{person.sharedActivityCount}</span>{' '}
          shared {person.sharedActivityCount === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      {/* Shared activities list */}
      {person.sharedActivities.length > 0 && (
        <div className="space-y-1.5 mb-3 flex-1">
          {person.sharedActivities.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-olive-50 border border-olive-100"
            >
              <span className="text-xs text-olive-700 truncate font-medium">{a.title}</span>
              <ActivityBadge status={a.status} />
            </div>
          ))}
        </div>
      )}

      <Link
        to={`/people/${person.username}`}
        className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-olive-100 text-olive-700 text-xs font-semibold hover:bg-olive-200 transition-colors"
      >
        View Profile <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function PeoplePage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['people', { search: debouncedSearch, page }],
    queryFn: () =>
      usersApi.getPeople({ page, limit: 20, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  });

  const people: ActivityConnectionPerson[] = data?.items ?? [];
  const hasMore: boolean = data?.hasMore ?? false;
  const total: number = data?.total ?? 0;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title mb-1">People You've Met</h1>
        <p className="text-olive-500 text-sm">
          {isLoading
            ? 'Loading...'
            : total > 0
            ? `${total} ${total === 1 ? 'person' : 'people'} from your shared activities`
            : 'People you meet through activities will appear here.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or username..."
          className="input-field pl-12 pr-12 py-4 text-base"
          id="people-search"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-olive-50" />
          ))}
        </div>
      ) : people.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {people.map((person) => (
              <PersonMetCard key={person.id} person={person} />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || page > 1) && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm py-2 px-5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-olive-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="btn-secondary text-sm py-2 px-5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-20 max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-olive-100 flex items-center justify-center">
            <Users className="w-10 h-10 text-olive-400" />
          </div>
          <h3
            style={{ fontFamily: 'var(--font-poppins)' }}
            className="font-bold text-xl text-olive-900 mb-2"
          >
            {search ? 'No results found' : "You haven't met anyone yet."}
          </h3>
          <p className="text-olive-500 text-sm mb-6">
            {search
              ? 'Try a different search term.'
              : 'Join or host an activity to start meeting people.'}
          </p>
          {!search && (
            <Link to="/activities" className="btn-primary inline-flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4" />
              Explore Activities
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
