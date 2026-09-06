import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities.api';
import { ActivityCard } from '@/components/ActivityCard';
import {
  Leaf, ArrowRight, Users, CalendarDays, MapPin,
  Star, ChevronRight, Sparkles, Globe, Heart,
} from 'lucide-react';
import { mockActivities } from '@/lib/mockData';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';

const categories = [
  { emoji: '🎵', label: 'Music' },
  { emoji: '🏔️', label: 'Outdoors' },
  { emoji: '📸', label: 'Photography' },
  { emoji: '🍕', label: 'Food & Drinks' },
  { emoji: '💻', label: 'Tech' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '📚', label: 'Books' },
  { emoji: '🧘', label: 'Wellness' },
];

const cities = ['San Francisco', 'New York', 'Austin', 'Los Angeles', 'Chicago', 'Seattle'];

const howItWorks = [
  { icon: Globe, title: 'Discover', desc: 'Browse activities, events, and groups in your city that match your passions.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'Connect', desc: 'Meet like-minded people, join activities and build real friendships.', color: 'bg-rose-100 text-rose-600' },
  { icon: Sparkles, title: 'Grow', desc: 'Learn new skills, explore new interests, and share experiences together.', color: 'bg-olive-100 text-olive-700' },
];

const testimonials = [
  { name: 'Riya M.', city: 'San Francisco', text: 'I found my hiking tribe through Olive! Best platform for meeting like-minded people.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya', stars: 5 },
  { name: 'Tom K.', city: 'New York', text: 'As someone new to the city, this platform helped me make genuine friends in just weeks!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', stars: 5 },
  { name: 'Anita B.', city: 'Austin', text: 'The guitar jam sessions changed my weekends completely. So much fun and great people!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita', stars: 5 },
];

export function LandingPage() {
  const [introState, setIntroState] = useState<'initial' | 'playing' | 'moving' | 'hidden'>(() => {
    return sessionStorage.getItem('hasSeenIntro') ? 'hidden' : 'initial';
  });

  useEffect(() => {
    if (introState === 'initial') {
      const timer = setTimeout(() => setIntroState('playing'), 50);
      return () => clearTimeout(timer);
    }
  }, [introState]);
  
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    navigate('/');
  };

  const handleIntroEnd = () => {
    setIntroState('moving');
    setTimeout(() => {
      setIntroState('hidden');
      sessionStorage.setItem('hasSeenIntro', 'true');
    }, 500);
  };

  const skipIntro = () => {
    setIntroState('hidden');
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  if (introState !== 'hidden') {
    const isMoving = introState === 'moving';
    return (
      <div className={`fixed inset-0 z-[100] transition-colors duration-500 ${isMoving ? 'bg-transparent pointer-events-none' : 'bg-cream'}`}>
        <div 
          className="absolute transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden"
          style={{
            top: isMoving ? '16px' : '50%',
            left: isMoving ? 'calc(50vw - min(640px, 50vw) + 16px)' : '50%',
            transform: isMoving ? 'translate(0, 0)' : 'translate(-50%, -50%)',
            width: isMoving ? '48px' : '280px',
            height: isMoving ? '48px' : '280px',
            borderRadius: isMoving ? '12px' : '50%',
            opacity: isMoving ? 0 : 1,
          }}
        >
          <video 
            src="/intro.mp4" 
            autoPlay 
            muted 
            playsInline
            onEnded={handleIntroEnd}
            ref={(el) => { if (el) el.playbackRate = 2.0; }}
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        {!isMoving && (
          <button 
            onClick={skipIntro}
            className="absolute bottom-8 right-8 text-olive-400 hover:text-olive-600 transition-colors text-sm font-medium z-10"
          >
            Skip Intro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-inter">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logopng.png" alt="Olive Logo" className="w-12 h-12 object-contain" />
              <span className="font-poppins font-bold text-olive-900 text-lg">
                Olive
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-olive-600">
              <a href="#activities" className="hover:text-olive-800 transition-colors">Explore</a>
              <a href="#how-it-works" className="hover:text-olive-800 transition-colors">How It Works</a>
              <a href="#cities" className="hover:text-olive-800 transition-colors">Cities</a>
              <a href="#blog" className="hover:text-olive-800 transition-colors">Blog</a>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex">
                    Logout
                  </button>
                  <Link to="/dashboard" className="btn-primary text-sm py-2 px-5">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm py-2 px-5">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient dot-pattern relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-100 text-olive-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Discover activities near you</span>
              </div>
              <h1 className="font-poppins font-bold text-5xl lg:text-6xl text-olive-900 leading-tight mb-6">
                Discover
                <span className="text-olive-500"> activities.</span>
                <br />Meet people.
                <br />
                <span className="relative">
                  Build real
                  <span className="text-olive-500"> connections.</span>
                </span>
              </h1>
              <p className="text-lg text-olive-600 mb-8 leading-relaxed max-w-xl">
                Find events, learn new skills, and connect with people who share your interests.
                Olive makes it easy to turn hobbies into friendships.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary text-base px-8 py-4">
                  Explore Activities <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4">
                  Create Account
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div>
                  <span className="font-poppins font-bold text-2xl text-olive-900">50K+</span>
                  <p className="text-xs text-olive-500">Active members</p>
                </div>
                <div className="w-px h-8 bg-olive-200" />
                <div>
                  <span className="font-poppins font-bold text-2xl text-olive-900">2K+</span>
                  <p className="text-xs text-olive-500">Activities monthly</p>
                </div>
                <div className="w-px h-8 bg-olive-200" />
                <div>
                  <span className="font-poppins font-bold text-2xl text-olive-900">120+</span>
                  <p className="text-xs text-olive-500">Cities</p>
                </div>
              </div>
            </div>

            {/* Hero illustration area - activity cards floating */}
            <div className="hidden lg:block relative animate-float">
              <div className="relative w-full h-[420px]">
                {/* Main card */}
                <div className="absolute top-4 left-8 right-8 card p-5 shadow-card-hover">
                  <div className="flex items-center gap-3 mb-3">
                    <img src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=60&q=80" alt="" className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h3 className="font-poppins font-bold text-olive-900">Guitar Jam Session</h3>
                      <p className="text-sm text-olive-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Today, 6:00 PM</p>
                      <p className="text-sm text-olive-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Downtown Music Hub</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {['Alex','James','Priya'].map(n => (
                        <img key={n} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n}`} className="w-8 h-8 rounded-full ring-2 ring-white" alt={n} />
                      ))}
                      <div className="w-8 h-8 rounded-full ring-2 ring-white bg-olive-100 flex items-center justify-center text-xs font-bold text-olive-600">+9</div>
                    </div>
                    <span className="badge-olive">Free</span>
                  </div>
                </div>

                {/* Floating mini cards */}
                <div className="absolute bottom-24 left-0 card p-3 shadow-card w-44 animate-float" style={{ animationDelay: '1s' }}>
                  <p className="text-xs font-semibold text-olive-900">🏔️ Weekend Hike</p>
                  <p className="text-xs text-olive-500">26 attending</p>
                  <div className="h-1 bg-olive-100 rounded-full mt-2"><div className="h-1 bg-olive-500 rounded-full w-4/5" /></div>
                </div>

                <div className="absolute bottom-4 right-4 card p-3 shadow-card w-44 animate-float" style={{ animationDelay: '2s' }}>
                  <p className="text-xs font-semibold text-olive-900">📸 Photo Walk</p>
                  <p className="text-xs text-olive-500">16 attending</p>
                  <div className="h-1 bg-olive-100 rounded-full mt-2"><div className="h-1 bg-olive-400 rounded-full w-3/5" /></div>
                </div>

                <div className="absolute top-1/2 right-0 card px-3 py-2 shadow-card animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-olive-500" />
                    <span className="text-xs font-semibold text-olive-900">12 joined today!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30C360 60 1080 0 1440 30V60H0V30Z" fill="#faf8f3" />
          </svg>
        </div>
      </section>

      {/* Upcoming Activities */}
      <UpcomingActivities />

      {/* Categories */}
      <section className="py-16 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">Explore by Category</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {categories.map(({ emoji, label }) => (
              <Link
                key={label}
                to="/signup"
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white hover:bg-olive-100 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-card hover:shadow-card-hover"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-olive-700 text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section id="cities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="section-title text-center mb-3">Popular Cities</h2>
        <p className="text-center text-olive-500 mb-10">Activities happening all across the country</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city}
              to="/signup"
              className="card-hover flex flex-col items-center gap-2 py-6 px-4 text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-olive-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-olive-600" />
              </div>
              <span className="font-medium text-olive-800 text-sm">{city}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-olive-800 to-olive-950 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-3xl text-white text-center mb-3">How Olive Works</h2>
          <p className="text-olive-200 text-center mb-14 max-w-lg mx-auto">Three simple steps to start building real connections</p>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-3xl ${color} flex items-center justify-center mb-5 shadow-card`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="w-8 h-8 rounded-full bg-olive-600 text-white font-bold text-sm flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <h3 className="font-poppins font-bold text-xl text-white mb-2">{title}</h3>
                <p className="text-olive-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="section-title text-center mb-12">What people are saying 💬</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, city, text, avatar, stars }) => (
            <div key={name} className="card p-6 hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-olive-700 text-sm leading-relaxed mb-5 italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full ring-2 ring-olive-200" />
                <div>
                  <p className="font-semibold text-olive-900 text-sm">{name}</p>
                  <p className="text-xs text-olive-500">{city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-olive-500 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-poppins font-bold text-4xl text-white mb-4">Ready to find your people?</h2>
          <p className="text-olive-100 text-lg mb-8">Join thousands of people discovering activities and making real connections every day.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-olive-700 font-poppins font-bold text-base rounded-2xl hover:bg-olive-50 transition-all duration-200 shadow-card-hover hover:scale-105">
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-olive-950 text-olive-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logopng.png" alt="Olive Logo" className="w-12 h-12 object-contain" />
              <span className="font-poppins font-bold text-white text-lg">
                Olive
              </span>
            </div>
            <p className="text-sm text-olive-500">© 2025 Olive. Made with 🌿 for people who love doing things together.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UpcomingActivities() {
  const { data } = useQuery({
    queryKey: ['activities', 'landing-page'],
    queryFn: () => activitiesApi.getAll({ limit: 4, status: 'ACTIVE' }),
  });

  const activities = data?.items ?? [];

  return (
    <section id="activities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="section-title">Upcoming Activities</h2>
          <p className="text-olive-500 mt-1">Discover what's happening near you</p>
        </div>
        <Link to="/signup" className="btn-ghost text-sm">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} variant="grid" />
        ))}
      </div>
    </section>
  );
}
