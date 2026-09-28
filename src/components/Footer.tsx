import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Footer() {
  return (
    <footer 
      className="relative bg-olive-950 text-olive-300 pt-24 pb-8 overflow-hidden border-t border-olive-900/50"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Background Noise / Texture (subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      />

      {/* Funky social dot pattern (right side subtle connection pattern) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-[0.05] animate-pulse-soft">
        <svg viewBox="0 0 100 100" className="w-full h-full text-olive-400">
          <circle cx="20" cy="30" r="1.5" fill="currentColor" />
          <circle cx="80" cy="20" r="2" fill="currentColor" />
          <circle cx="70" cy="80" r="1.5" fill="currentColor" />
          <circle cx="30" cy="70" r="2" fill="currentColor" />
          <circle cx="50" cy="50" r="1" fill="currentColor" />
          <path d="M20,30 L50,50 L80,20" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
          <path d="M30,70 L50,50 L70,80" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" />
          <path d="M20,30 L30,70" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,1" />
        </svg>
      </div>
      
      {/* Subtle organic top curve overlay (optional visual depth) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-olive-950 to-transparent pointer-events-none z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* BRAND SECTION (Left) */}
          <div className="col-span-1 lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="relative">
                <img src="/logopng.png" alt="Olive Logo" className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-olive-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
              </div>
              <span 
                className="font-bold text-white text-2xl tracking-tight group-hover:text-olive-100 transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                LetsDoTogether
              </span>
            </Link>
            
            <h3 
              className="text-white font-semibold text-2xl mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Do more together.
            </h3>
            
            <p className="text-olive-400 text-base leading-relaxed mb-8 max-w-sm">
              Discover people, share your interests, and turn common passions into real experiences.
            </p>
          </div>

          {/* LINKS SECTION (Center/Right) */}
          <div className="col-span-1 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            <FooterColumn 
              title="PRODUCT"
              links={[
                { label: 'Discover People', to: '/people' },
                { label: 'Activities', to: '/activities' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'Help Center', to: '/help' },
                { label: 'Contact', to: '/contact' },
              ]}
            />
            <FooterColumn 
              title="COMMUNITY"
              links={[
                { label: 'Community', to: '/community' },
                { label: 'Roadmap', to: '/roadmap' },
                { label: 'Feature Requests', to: '/feature-requests' },
                { label: 'Safety', to: '/community#safety' },
                { label: 'Community Guidelines', to: '/community#guidelines' },
              ]}
            />
            <FooterColumn 
              title="OPEN SOURCE"
              links={[
                { label: 'Contribute', to: '/contribute' },
                { label: 'Documentation', to: '/documentation' },
                { label: 'Report a Bug', to: '/contact' },
                { label: 'Changelog', to: '/changelog' },
              ]}
            />
            <FooterColumn 
              title="LEGAL"
              links={[
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Security', to: '/security' },
                { label: 'Cookie Policy', to: '/privacy#cookies' },
              ]}
            />
          </div>
        </div>

        {/* OPEN SOURCE HIGHLIGHT */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-12 group"
          style={{
            backgroundColor: 'var(--color-olive-950)',
            border: '1px solid rgba(111, 154, 53, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Subtle glow background inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-olive-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-olive-400/20 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-olive-400 animate-pulse shadow-[0_0_8px_rgba(139,180,81,0.6)]" />
                <h4 
                  className="text-olive-100 font-semibold text-lg"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Built in the open.
                </h4>
              </div>
              <p className="text-olive-400 text-sm md:text-base leading-relaxed">
                Help us build a better way for people to connect, learn, and do things together. Our codebase is entirely open-source and community-driven.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto flex-shrink-0">
              <a 
                href="https://github.com/Olive-together"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-olive-500 text-white text-sm font-semibold rounded-xl hover:bg-olive-400 hover:shadow-[0_4px_16px_rgba(139,180,81,0.3)] hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto group/gh"
              >
                <span>View on GitHub</span> 
                <ArrowRight className="w-4 h-4 group-hover/gh:translate-x-0.5 transition-transform" />
              </a>
              <Link 
                to="/contribute"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-olive-700 text-olive-300 text-sm font-semibold rounded-xl hover:border-olive-500 hover:text-olive-100 hover:bg-olive-800/30 transition-all duration-200 w-full sm:w-auto group/contribute"
              >
                <span>Contribute</span> 
                <ArrowRight className="w-4 h-4 group-hover/contribute:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-olive-900 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-olive-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="text-olive-300 font-medium">© 2026 LetsDoTogether</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-olive-700" />
            <span>An open-source project by Olive</span>
          </div>
          
          <div className="text-center md:text-left">
            Made for people who love doing things together.
          </div>
          
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-olive-300 transition-colors hover:underline decoration-olive-700 underline-offset-4">Privacy</Link>
            <Link to="/terms" className="hover:text-olive-300 transition-colors hover:underline decoration-olive-700 underline-offset-4">Terms</Link>
            <Link to="/contact" className="hover:text-olive-300 transition-colors hover:underline decoration-olive-700 underline-offset-4">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div className="flex flex-col gap-5">
      <h4 
        className="text-olive-100 font-semibold text-xs tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h4>
      <ul className="flex flex-col gap-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link 
              to={link.to} 
              className="text-sm text-olive-400 hover:text-olive-200 transition-all duration-200 inline-flex items-center group"
            >
              <span className="relative">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-olive-500 transition-all duration-300 group-hover:w-full opacity-50" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
