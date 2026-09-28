import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-olive-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background dots */}
      <div className="absolute inset-0 dot-pattern opacity-5 pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(111,154,53,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div
        className="relative flex flex-col items-center text-center max-w-lg transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
        }}
      >
        {/* Big 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="font-poppins font-black text-cream leading-none"
            style={{ fontSize: 'clamp(7rem, 20vw, 11rem)', opacity: 0.06 }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{
                background: 'rgba(111,154,53,0.15)',
                border: '1px solid rgba(111,154,53,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              🌿
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-poppins font-bold text-cream mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
          Page not found
        </h1>

        <p className="text-olive-400 text-lg leading-relaxed mb-10 max-w-sm">
          The page you're looking for doesn't exist, was moved, or the link might be wrong.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-olive-500 hover:bg-olive-400 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-[0_8px_24px_rgba(111,154,53,0.3)]"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-olive-700 text-olive-300 hover:border-olive-500 hover:text-olive-100 hover:bg-olive-900/40 font-semibold text-sm transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-olive-800/60 w-full">
          <p className="text-olive-600 text-xs uppercase tracking-widest mb-4 font-semibold">
            Maybe you were looking for
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'Activities', to: '/activities' },
              { label: 'People', to: '/people' },
              { label: 'How it works', to: '/how-it-works' },
              { label: 'Help', to: '/help' },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-olive-800 text-olive-400 hover:border-olive-600 hover:text-olive-200 hover:bg-olive-900/40 transition-all duration-200"
              >
                <Search className="w-3 h-3" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
