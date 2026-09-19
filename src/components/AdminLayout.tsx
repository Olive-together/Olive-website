import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Shield, Activity, LogOut, ChevronRight } from 'lucide-react';

/**
 * AdminLayout — Completely isolated from the regular AppLayout.
 * - Only accessible to users with role === 'ADMIN'
 * - Dark, authoritative design that signals control-centre context
 */
export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  // Must be authenticated
  if (!user) return <Navigate to="/admin/login" replace />;

  // Must be ADMIN role
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { path: '/admin', label: 'Activity Monitor', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#0d1117', fontFamily: 'var(--font-inter)' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col border-r"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: '#30363d' }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6f9a35, #435e21)' }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
              Olive Admin
            </p>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
              style={{ background: 'rgba(248,81,73,0.12)', color: '#ff7b72', border: '1px solid rgba(248,81,73,0.25)' }}
            >
              ADMIN CONTROL CENTRE
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'rgba(111,154,53,0.15)' : 'transparent',
                  color: active ? '#8bb451' : '#8b949e',
                  border: active ? '1px solid rgba(111,154,53,0.25)' : '1px solid transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer — admin identity */}
        <div className="px-4 py-4 border-t" style={{ borderColor: '#30363d' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6f9a35, #435e21)' }}
            >
              {(user.profile?.displayName ?? user.username)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: '#3fb950', boxShadow: '0 0 10px rgba(63,185,80,0.75)' }}
                />
                <p className="text-white text-xs font-semibold truncate">
                  {user.profile?.displayName ?? user.username}
                </p>
              </div>
              <p className="text-xs truncate" style={{ color: '#8b949e' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ color: '#f85149', background: 'rgba(248,81,73,0.08)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
