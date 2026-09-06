import { useState, useCallback } from 'react';
import { Grid, List, Map as MapIcon, Search, MapPin, X, Navigation } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities.api';
import { ActivityCard } from '@/components/ActivityCard';
import { MapView } from '@/components/MapView';
import { cn } from '@/lib/cn';
import { LocationSelector } from '@/components/LocationSelector';

const CATEGORIES = ['All', 'Music', 'Sports', 'Art', 'Food', 'Technology', 'Outdoors', 'Education', 'Social', 'Fitness', 'Gaming', 'Business'];

export function ActivitiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [timeline, setTimeline] = useState<'upcoming' | 'past'>('upcoming');
  
  // Location features
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(20);
  const [isLocating, setIsLocating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['activities', { city: selectedCity, state: selectedState, country: selectedCountry, category: selectedCategory, lat: location?.lat, lng: location?.lng, radiusKm, timeline }],
    queryFn: () =>
      activitiesApi.getAll({
        city: selectedCity || undefined,
        state: selectedState || undefined,
        status: 'ACTIVE',
        timeline,
        lat: location?.lat?.toString(),
        lng: location?.lng?.toString(),
        radiusKm: location ? radiusKm.toString() : undefined,
      }),
  });

  const handleUseLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        setSelectedCountry('');
        setSelectedState('');
        setSelectedCity(''); // clear city if using GPS
      },
      (err) => {
        console.error(err);
        alert('Could not get your location. Please check browser permissions.');
        setIsLocating(false);
      }
    );
  };

  const activities = data?.items ?? [];

  const filtered = activities.filter((a) => {
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || selectedCategory === 'All' || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedCategory('');
    setSelectedCity('');
    setLocation(null);
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title mb-1">Activities 🎯</h1>
        <p className="text-olive-500">
          {isLoading ? 'Loading activities...' : `Discover ${activities.length} activities happening near you`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activities, interests, skills..."
          className="input-field pl-12 pr-12 py-4 text-base"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 min-w-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                (cat === selectedCategory || (cat === 'All' && !selectedCategory))
                  ? 'bg-olive-500 text-white shadow-btn'
                  : 'bg-white border border-olive-100 text-olive-600 hover:border-olive-300'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline toggle */}
        <div className="flex items-center gap-1 bg-olive-50 p-1 rounded-xl">
          <button
            onClick={() => setTimeline('upcoming')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              timeline === 'upcoming' ? "bg-white text-olive-800 shadow-sm" : "text-olive-600 hover:text-olive-800"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setTimeline('past')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              timeline === 'past' ? "bg-white text-olive-800 shadow-sm" : "text-olive-600 hover:text-olive-800"
            )}
          >
            Past
          </button>
        </div>

        {/* Location filter */}
        <div className="flex items-center gap-2">
          <div className="min-w-[280px]">
            <LocationSelector
              country={selectedCountry}
              state={selectedState}
              city={selectedCity}
              onChange={(loc) => {
                setSelectedCountry(loc.country);
                setSelectedState(loc.state);
                setSelectedCity(loc.city);
                if (loc.city || loc.state || loc.country) setLocation(null);
              }}
              className="gap-2 sm:grid-cols-3"
            />
          </div>
          
          <button
            onClick={handleUseLocation}
            disabled={isLocating}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-colors",
              location ? "bg-olive-100 border-olive-200 text-olive-800" : "bg-white border-olive-100 text-olive-600 hover:bg-olive-50"
            )}
          >
            <Navigation className={cn("w-4 h-4", isLocating && "animate-pulse")} />
            {location ? "GPS Active" : "Near Me"}
          </button>

          {location && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-olive-100 rounded-xl">
              <span className="text-xs font-semibold text-olive-500">Radius</span>
              <input 
                type="range" 
                min="5" max="100" step="5"
                value={radiusKm} 
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-24 accent-olive-500"
              />
              <span className="text-xs font-bold text-olive-700 w-8">{radiusKm}km</span>
            </div>
          )}

          {(search || selectedCategory || selectedCountry || selectedState || selectedCity || location) && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs text-olive-500 hover:text-olive-700 border border-olive-200 rounded-xl hover:bg-olive-50">
              Clear
            </button>
          )}

          <div className="flex items-center gap-1 bg-white border border-olive-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-olive-500 text-white' : 'text-olive-500 hover:bg-olive-50')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-olive-500 text-white' : 'text-olive-500 hover:bg-olive-50')}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'map' ? 'bg-olive-500 text-white' : 'text-olive-500 hover:bg-olive-50')}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-olive-500 mb-5">
        Showing <span className="font-semibold text-olive-700">{filtered.length}</span> activities
        {selectedCategory && selectedCategory !== 'All' && <> in <span className="font-semibold text-olive-700">{selectedCategory}</span></>}
      </p>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-olive-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <p className="text-olive-500 text-lg font-medium">No activities found</p>
          <p className="text-olive-400 text-sm mt-1">Try adjusting your filters or location</p>
        </div>
      ) : viewMode === 'map' ? (
        <MapView activities={filtered} center={location ?? undefined} className="h-[600px] w-full rounded-2xl shadow-card border border-olive-100" />
      ) : (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-3xl mx-auto'
          )}
        >
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} variant={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
