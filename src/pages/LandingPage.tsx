import { useState, useEffect, useRef, useCallback } from 'react';
import cityVideo from '@/assets/create_a_vedio_with_off_white.mp4';
import imgArt from '@/assets/explore_by_category_landing_page/art.png';
import imgBooks from '@/assets/explore_by_category_landing_page/books.png';
import imgFood from '@/assets/explore_by_category_landing_page/food&drinks.png';
import imgMusic from '@/assets/explore_by_category_landing_page/music.png';
import imgOutdoors from '@/assets/explore_by_category_landing_page/outdoors.png';
import imgPhotography from '@/assets/explore_by_category_landing_page/photography.png';
import imgTech from '@/assets/explore_by_category_landing_page/tech.png';
import imgWellness from '@/assets/explore_by_category_landing_page/wellness.png';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api/activities.api';
import { ActivityCard } from '@/components/ActivityCard';
import { Footer } from '@/components/Footer';
import {
  ArrowRight,
  Star, ChevronRight, Sparkles, Globe, Heart,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';



const howItWorks = [
  { icon: Globe, title: 'Discover', desc: 'Browse activities, events, and groups in your city that match your passions.', color: 'bg-blue-100 text-blue-600' },
  { icon: Heart, title: 'Connect', desc: 'Meet like-minded people, join activities and build real friendships.', color: 'bg-rose-100 text-rose-600' },
  { icon: Sparkles, title: 'Grow', desc: 'Learn new skills, explore new interests, and share experiences together.', color: 'bg-olive-100 text-olive-700' },
];

const testimonials = [
  { name: 'Himesh B.', city: 'Dehradun', text: 'I found my hiking tribe through OliveBest platform for meeting like-minded people.', avatar: 'https://api.dicebear.com/10.x/avataaars/svg?seed=Rahul', stars: 5 },
  { name: 'Devang B.', city: 'Bangalore', text: 'As someone new to the city, this platform helped me make genuine friends in just weeks!', avatar: 'https://api.dicebear.com/10.x/micah/svg?seed=Rahul', stars: 5 },
  { name: 'Utkarsh K.', city: 'Mumbai', text: 'The guitar jam sessions changed my weekends completely. So much fun and great people!', avatar: 'https://api.dicebear.com/10.x/open-peeps/svg?seed=Rahul', stars: 5 },
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
              <img src="/logopng.png" alt="Olive Logo" className="w-14 h-14 object-contain" />
              <span className="font-poppins font-bold text-olive-900 text-2xl tracking-tight">
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
                <Link to={user ? "/activities" : "/signup"} className="btn-primary text-base px-8 py-4">
                  Explore Activities <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to={user ? "/activities" : "/signup"} className="btn-secondary text-base px-8 py-4">
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

            {/* Hero illustration area - abstract visual */}
            <div className="hidden lg:flex relative items-center justify-center h-[420px] w-full">
              {/* Abstract background blurs */}
              <div className="absolute w-72 h-72 bg-olive-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute w-64 h-64 bg-olive-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse translate-x-20 translate-y-10" style={{ animationDuration: '5s' }} />
              
              {/* Abstract connection rings */}
              <div className="relative w-80 h-80 opacity-70 animate-float">
                <svg viewBox="0 0 200 200" className="w-full h-full text-olive-500">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
                  <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  
                  {/* Nodes */}
                  <circle cx="100" cy="15" r="4" fill="currentColor" />
                  <circle cx="185" cy="100" r="5" fill="currentColor" opacity="0.8" />
                  <circle cx="100" cy="185" r="4" fill="currentColor" opacity="0.6" />
                  <circle cx="15" cy="100" r="3" fill="currentColor" opacity="0.9" />
                  
                  <circle cx="139" cy="61" r="3" fill="currentColor" />
                  <circle cx="61" cy="139" r="4" fill="currentColor" opacity="0.7" />
                  <circle cx="61" cy="61" r="3" fill="currentColor" opacity="0.8" />
                  
                  {/* Connecting lines */}
                  <line x1="100" y1="15" x2="139" y2="61" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                  <line x1="139" y1="61" x2="185" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                  <line x1="185" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  <line x1="100" y1="185" x2="61" y2="139" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                  <line x1="15" y1="100" x2="61" y2="139" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                  <line x1="61" y1="139" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  <line x1="61" y1="61" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                  <line x1="61" y1="61" x2="100" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                  <line x1="61" y1="61" x2="15" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
                </svg>
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

      {/* Why Olive */}
      <section className="py-24 lg:py-32 bg-olive-950 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 dot-pattern opacity-5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Columns */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
            <div className="reveal-on-scroll">
              <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-cream leading-tight mb-6">
                Social media connects you to content.<br />
                <span className="text-olive-400">Olive connects you to people.</span>
              </h2>
              <p className="text-olive-200 text-lg leading-relaxed">
                Loneliness isn't a lack of communication — it's a lack of shared experience. You can have 500 followers and still not have anyone to grab coffee with. Olive flips the question. Instead of 'who do you want to follow?' we ask 'what do you enjoy doing, and who can you do it with?' That's the difference between a feed and a friendship.
              </p>
            </div>
            
            {/* Visual contrast */}
            <div className="flex justify-center lg:justify-end reveal-on-scroll delay-200">
              <div className="flex items-center gap-4 sm:gap-8 text-olive-300">
                {/* Content Icon (Disconnected) */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32 border-2 border-olive-700 rounded-xl p-2 flex flex-col gap-2">
                    <div className="w-full h-1/2 bg-olive-800/50 rounded-md" />
                    <div className="w-3/4 h-2 bg-olive-800/50 rounded-full" />
                    <div className="w-1/2 h-2 bg-olive-800/50 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-olive-700" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-olive-700" />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-olive-700" />
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-olive-600 flex-shrink-0" />

                {/* People Icon (Connected) */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-olive-400">
                    <circle cx="50" cy="20" r="8" fill="currentColor" />
                    <circle cx="80" cy="70" r="8" fill="currentColor" />
                    <circle cx="20" cy="70" r="8" fill="currentColor" />
                    <circle cx="50" cy="50" r="8" fill="currentColor" />
                    
                    <line x1="50" y1="28" x2="50" y2="42" stroke="currentColor" strokeWidth="2" />
                    <line x1="44" y1="54" x2="26" y2="66" stroke="currentColor" strokeWidth="2" />
                    <line x1="56" y1="54" x2="74" y2="66" stroke="currentColor" strokeWidth="2" />
                    <line x1="28" y1="70" x2="72" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Pull Quote / Stat */}
          <div className="text-center mb-24 max-w-2xl mx-auto reveal-on-scroll">
            <span className="font-poppins font-bold text-6xl lg:text-8xl text-cream block mb-4">1 in 6</span>
            <span className="text-olive-400 text-base lg:text-lg uppercase tracking-widest font-semibold block px-4">people worldwide experience loneliness</span>
            <p className="text-olive-600 text-sm mt-2">— WHO, 2025</p>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative max-w-4xl mx-auto reveal-on-scroll">
            {/* Vertical divider for desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-olive-800 -translate-x-1/2" />
            
            <div className="space-y-6 md:pr-8">
              <h3 className="font-poppins text-olive-500 font-semibold mb-6">Traditional social media</h3>
              <ul className="space-y-4 text-olive-600">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-olive-700" /> Content-first</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-olive-700" /> Followers</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-olive-700" /> Passive scrolling</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-olive-700" /> Online only</li>
              </ul>
            </div>

            <div className="space-y-6 md:pl-8">
              <h3 className="font-poppins text-olive-300 font-semibold mb-6">Olive</h3>
              <ul className="space-y-4 text-olive-300 font-medium">
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-olive-400 shadow-[0_0_8px_rgba(139,180,81,0.5)]" /> Activity-first</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-olive-400 shadow-[0_0_8px_rgba(139,180,81,0.5)]" /> Connections</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-olive-400 shadow-[0_0_8px_rgba(139,180,81,0.5)]" /> Real participation</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-olive-400 shadow-[0_0_8px_rgba(139,180,81,0.5)]" /> Online → real world</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Activities */}
      <UpcomingActivities />

      {/* Categories */}
      <CategoriesSection />

      {/* Active Across India — Video Split Section */}
      <CitiesVideoSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-olive-950 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-poppins font-bold text-4xl lg:text-5xl text-white text-center mb-4 reveal-on-scroll">How Olive Works</h2>
          <p className="text-olive-300 text-center mb-20 text-lg reveal-on-scroll delay-100">Three simple steps to start building real connections</p>
          
          <div className="relative grid md:grid-cols-3 gap-6 lg:gap-10">
            {/* Connecting Dotted Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-[5rem] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-olive-700/50 z-0"></div>

            {howItWorks.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className={`relative z-10 flex flex-col items-center text-center rounded-[2rem] p-10 overflow-hidden reveal-on-scroll delay-${(i + 1) * 100}`} style={{ backgroundColor: '#1d2716', border: '1px solid rgba(139, 180, 81, 0.15)' }}>
                {/* Giant Background Number */}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-poppins font-black text-[10rem] leading-none text-white/[0.025] select-none pointer-events-none">
                  0{i + 1}
                </span>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-3xl ${color} flex items-center justify-center mb-8 shadow-lg`}>
                  <Icon className="w-10 h-10" />
                </div>
                
                {/* Content */}
                <h3 className="font-poppins font-bold text-2xl text-white mb-4">{title}</h3>
                <p className="text-olive-300 text-base leading-relaxed max-w-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="section-title text-center mb-12 reveal-on-scroll">What people are saying 💬</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, city, text, avatar, stars }, i) => (
            <div key={name} className={`card p-6 hover:shadow-card-hover transition-shadow duration-300 reveal-on-scroll delay-${(i + 1) * 100}`}>
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
        <div className="relative max-w-3xl mx-auto px-4 text-center reveal-on-scroll">
          <h2 className="font-poppins font-bold text-4xl text-white mb-4">Ready to find your people?</h2>
          <p className="text-olive-100 text-lg mb-8">Real connection doesn't start with a follow. It starts with showing up.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-olive-700 font-poppins font-bold text-base rounded-2xl hover:bg-olive-50 transition-all duration-200 shadow-card-hover hover:scale-105">
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ── Cities Video Split Section ─────────────────────────────────────────────

function CitiesVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Trim the last second by looping back 1s before end
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime >= video.duration - 1) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad',
    'Pune', 'Chennai', 'Kolkata', 'Bhopal',
    'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow',
  ];

  return (
    <section
      id="cities"
      ref={sectionRef}
      className="relative overflow-hidden bg-olive-950"
    >
      {/* Subtle dot texture */}
      <div className="absolute inset-0 dot-pattern opacity-5 pointer-events-none" />

      <div className="relative mx-auto px-6 sm:px-10 lg:px-20 py-20 lg:py-28" style={{ maxWidth: '1440px' }}>
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* ── LEFT: Video ── */}
          <div
            className="w-full lg:w-1/2 flex-shrink-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
              style={{ aspectRatio: '16/11', maxHeight: '540px' }}
            >
              {/* Olive glow border */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none z-20"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(111,154,53,0.3)' }}
              />
              <video
                ref={videoRef}
                src={cityVideo}
                autoPlay
                muted
                playsInline
                loop={false}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
              />
              {/* Bottom gradient overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10 h-20 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(26,35,17,0.75) 0%, transparent 100%)' }}
              />
            </div>
          </div>

          {/* ── RIGHT: Text ── */}
          <div
            className="w-full lg:w-1/2 flex flex-col justify-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
            }}
          >
            {/* Overline */}
            <span
              className="inline-block text-olive-400 text-sm font-semibold uppercase tracking-[0.18em] mb-5"
            >
              Where we are
            </span>

            {/* Headline */}
            <h2
              className="font-poppins font-bold text-cream leading-[1.08] mb-6"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)' }}
            >
              Available in<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #8bb451 0%, #c4e27a 50%, #6f9a35 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                every city.
              </span>
            </h2>

            {/* Sub-copy */}
            <p className="text-olive-300 text-lg leading-relaxed mb-10 max-w-md">
              From metro hubs to smaller towns — wherever you are,
              your community is already here. Olive is growing across
              India so you're never far from the next adventure.
            </p>

            {/* Animated city pills */}
            <div className="flex flex-wrap gap-2.5">
              {cities.map((city, i) => (
                <Link
                  key={city}
                  to="/signup"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border border-olive-700 text-olive-300 hover:border-olive-400 hover:text-olive-100 hover:bg-olive-800/40 transition-all duration-200"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: `opacity 0.4s ease ${0.3 + i * 0.06}s, transform 0.4s ease ${0.3 + i * 0.06}s, border-color 0.2s, color 0.2s, background-color 0.2s`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-400 flex-shrink-0" />
                  {city}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div
              className="mt-10"
              style={{
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.6s ease 1s',
              }}
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-olive-500 hover:bg-olive-400 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-[0_8px_24px_rgba(111,154,53,0.35)]"
              >
                Find people near you <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function UpcomingActivities() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ['activities', 'landing-page'],
    queryFn: () => activitiesApi.getAll({ limit: 4, status: 'ACTIVE' }),
  });

  const activities = data?.items ?? [];

  return (
    <section id="activities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10 reveal-on-scroll">
        <div>
          <h2 className="section-title">Upcoming Activities</h2>
          <p className="text-olive-500 mt-1">Discover what's happening near you</p>
        </div>
        <Link to={user ? "/activities" : "/signup"} className="btn-ghost text-sm">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {/* Make cards horizontally scrollable */}
      <div className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory hide-scrollbar">
        {activities.map((activity, index) => (
          <div key={activity.id} className={`shrink-0 w-[280px] sm:w-[320px] snap-start reveal-on-scroll delay-${Math.min((index + 1) * 100, 500)}`}>
            <ActivityCard activity={activity} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Categories with scroll animation ──────────────────────────────────────

const categoryImages = [
  { label: 'Art', src: imgArt },
  { label: 'Books', src: imgBooks },
  { label: 'Food & Drinks', src: imgFood },
  { label: 'Music', src: imgMusic },
  { label: 'Outdoors', src: imgOutdoors },
  { label: 'Photography', src: imgPhotography },
  { label: 'Tech', src: imgTech },
  { label: 'Wellness', src: imgWellness },
];

function CategoriesSection() {
  const user = useAuthStore((s) => s.user);
  const trackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    
    const updateScales = () => {
      if (!trackRef.current) return;
      const cards = trackRef.current.querySelectorAll('.category-card');
      const centerX = window.innerWidth / 2;
      
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const distFromCenter = Math.abs(centerX - cardCenterX);
        
        // Calculate scale: max scale 1.15 when dist is 0, fading to 1 when dist is > 300
        const maxDist = 400;
        let scale = 1;
        if (distFromCenter < maxDist) {
          scale = 1 + (1 - distFromCenter / maxDist) * 0.15; // scales up to 1.15
        }
        
        // Apply transform
        (card as HTMLElement).style.transform = `scale(${scale})`;
        
        // Adjust z-index so scaled items are on top
        if (scale > 1.05) {
          (card as HTMLElement).style.zIndex = '10';
        } else {
          (card as HTMLElement).style.zIndex = '1';
        }
      });
      
      animationFrameId = requestAnimationFrame(updateScales);
    };
    
    animationFrameId = requestAnimationFrame(updateScales);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Duplicate items to ensure smooth infinite scroll
  const items = [...categoryImages, ...categoryImages, ...categoryImages, ...categoryImages];

  return (
    <section className="py-20 overflow-hidden relative" style={{ backgroundColor: '#F5F2EB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 reveal-on-scroll">
        <h2 className="font-poppins font-bold text-4xl text-olive-900 text-center">
          Explore by Category
        </h2>
        <p className="text-olive-600 text-center mt-3">Discover activities that match your passions</p>
      </div>

      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 4)); }
        }
        .marquee-track {
          display: flex;
          width: fit-content;
          animation: scrollMarquee 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .category-card {
          transition: transform 0.05s ease-out; /* Smooth out RAF updates just slightly */
          will-change: transform;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Make horizontally scrollable manually, while keeping marquee logic if they want, but typically users mean make it scrollable natively */}
      <div className="relative w-full overflow-x-auto hide-scrollbar">
        {/* Gradient fades for edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 z-20 pointer-events-none" style={{ background: 'linear-gradient(to right, #F5F2EB, transparent)' }} />
        <div className="absolute top-0 bottom-0 right-0 w-32 z-20 pointer-events-none" style={{ background: 'linear-gradient(to left, #F5F2EB, transparent)' }} />
        
        <div ref={trackRef} className="marquee-track py-12 px-4">
          {items.map((item, i) => (
            <Link
              key={i}
              to={user ? "/activities" : "/signup"}
              className="category-card flex flex-col items-center justify-center p-6 mx-4 rounded-3xl bg-white shadow-card hover:shadow-card-hover shrink-0 relative group cursor-pointer"
              style={{ width: '240px', height: '240px' }}
            >
              <div className="w-32 h-32 mb-5 overflow-hidden rounded-full shadow-inner border-[6px] border-olive-50 group-hover:border-olive-100 transition-colors duration-300">
                <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-poppins font-semibold text-lg text-olive-900 group-hover:text-olive-600 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
