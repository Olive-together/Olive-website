import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { cn } from '@/lib/cn';

interface LocationSelectorProps {
  country?: string;
  state?: string;
  city?: string;
  onChange: (location: { country: string; state: string; city: string }) => void;
  className?: string;
}

export function LocationSelector({ country = '', state = '', city = '', onChange, className }: LocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedState, setSelectedState] = useState(state);
  const [selectedCity, setSelectedCity] = useState(city);

  const countries = Country.getAllCountries();
  const states = selectedCountry ? State.getStatesOfCountry(countries.find(c => c.name === selectedCountry)?.isoCode || '') : [];
  const cities = selectedState ? City.getCitiesOfState(
    countries.find(c => c.name === selectedCountry)?.isoCode || '',
    states.find(s => s.name === selectedState)?.isoCode || ''
  ) : [];

  // Update local state if props change externally
  useEffect(() => {
    if (country !== selectedCountry || state !== selectedState || city !== selectedCity) {
      setSelectedCountry(country || '');
      setSelectedState(state || '');
      setSelectedCity(city || '');
    }
  }, [country, state, city]);

  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedState('');
    setSelectedCity('');
    onChange({ country: c, state: '', city: '' });
  };

  const handleStateChange = (s: string) => {
    setSelectedState(s);
    setSelectedCity('');
    onChange({ country: selectedCountry, state: s, city: '' });
  };

  const handleCityChange = (c: string) => {
    setSelectedCity(c);
    onChange({ country: selectedCountry, state: selectedState, city: c });
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", className)}>
      <div className="relative">
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="input-field appearance-none cursor-pointer w-full text-sm py-2 px-3"
        >
          <option value="">Select Country</option>
          {countries.map(c => (
            <option key={c.isoCode} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="relative">
        <select
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={!selectedCountry}
          className="input-field appearance-none cursor-pointer w-full text-sm py-2 px-3 disabled:opacity-50"
        >
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.isoCode} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="relative">
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!selectedState}
          className="input-field appearance-none cursor-pointer w-full text-sm py-2 px-3 disabled:opacity-50"
        >
          <option value="">Select City</option>
          {cities.map(c => (
            <option key={`${c.name}-${c.latitude}-${c.longitude}`} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
