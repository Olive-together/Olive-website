import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users.api';
import { PersonCard } from '@/components/PersonCard';

const INTERESTS = ['All', 'Photography', 'Music', 'Hiking', 'Books', 'Yoga', 'Coding', 'Art', 'Gaming', 'Travel'];

export function PeoplePage() {
  const [search, setSearch] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All');

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['recommendations', 'people'],
    queryFn: usersApi.getRecommended,
  });

  const filtered = people.filter((p) => {
    const name = p.profile?.displayName ?? p.username;
    const matchSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase());
    const matchInterest = selectedInterest === 'All'; // interests field not in basic profile
    return matchSearch && matchInterest;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title mb-1">People 👥</h1>
        <p className="text-olive-500">
          {isLoading ? 'Loading...' : `Discover ${people.length} people with shared interests`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="input-field pl-12 pr-12 py-4 text-base"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interest filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            onClick={() => setSelectedInterest(interest)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedInterest === interest
                ? 'bg-olive-500 text-white shadow-btn'
                : 'bg-white border border-olive-100 text-olive-600 hover:border-olive-300'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      <p className="text-sm text-olive-500 mb-5">
        Showing <span className="font-semibold text-olive-700">{filtered.length}</span> people
      </p>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-olive-50" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👋</div>
          <h3 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-xl text-olive-900 mb-2">No people found</h3>
          <p className="text-olive-500 text-sm">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
}
