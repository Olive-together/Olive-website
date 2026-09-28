import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';

export function PublicNavbar() {
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

  return (
    <nav className="sticky top-0 z-50 glass border-b border-olive-100" style={{ backgroundColor: 'rgba(250, 248, 243, 0.8)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logopng.png" alt="Olive Logo" className="w-12 h-12 object-contain" />
            <span className="font-bold text-olive-900 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              LetsDoTogether
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-olive-600">
            <Link to="/how-it-works" className="hover:text-olive-800 transition-colors">How It Works</Link>
            <Link to="/community" className="hover:text-olive-800 transition-colors">Community</Link>
            <Link to="/help" className="hover:text-olive-800 transition-colors">Help</Link>
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
  );
}
