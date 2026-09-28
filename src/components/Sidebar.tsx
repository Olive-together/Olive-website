import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, CalendarDays, Users, MessageCircle, Bell,
  User, Search, Settings, LogOut, Menu, X,
  ShieldCheck, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { notificationsApi } from '@/lib/api/notifications.api';
import { authApi } from '@/lib/api/auth.api';
import { cn } from '@/lib/cn';

const baseNavItems = [
  { to: '/dashboard',     label: 'Home',          icon: Home },
  { to: '/activities',    label: 'Activities',    icon: CalendarDays },
  { to: '/people',        label: 'People',        icon: Users },
  { to: '/messages',      label: 'Messages',      icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile',       label: 'Profile',       icon: User },
  { to: '/search',        label: 'Search',        icon: Search },
  { to: '/settings',      label: 'Settings',      icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30_000,
  });
  const unreadCount = unreadData?.count ?? 0;

  const navItems = [
    ...baseNavItems,
    ...(user?.role === 'ADMIN'
      ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }]
      : []),
  ].map((item) => ({
    ...item,
    badge: item.to === '/notifications' && unreadCount > 0 ? unreadCount : undefined,
    adminOnly: item.to === '/admin',
  }));

  const displayName = user?.profile?.displayName ?? user?.username ?? 'User';
  const avatar = user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <Link
        to="/"
        className={cn(
          'flex items-center gap-3 px-4 py-5 mb-1 flex-shrink-0',
          collapsed && 'justify-center px-0'
        )}
      >
        <img
          src="/logopng.png"
          alt="Olive Logo"
          className="w-12 h-12 object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div>
            <span
              style={{ fontFamily: 'var(--font-heading)' }}
              className="font-bold text-olive-900 text-xl tracking-tight leading-tight block"
            >
              LetsDoTogether
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Find your people
            </span>
          </div>
        )}
      </Link>

      {/* ── Divider ── */}
      <div className="mx-4 mb-3 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, badge, adminOnly }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={cn(
                'relative group',
                adminOnly
                  ? cn(
                      'mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      'border text-red-500 hover:text-red-600',
                      active
                        ? 'bg-red-50/80 border-red-200/60 text-red-600 font-semibold'
                        : 'bg-red-50/50 border-red-100/40 hover:bg-red-50/80',
                      collapsed && 'justify-center'
                    )
                  : active
                  ? cn('nav-link-active', collapsed && 'justify-center !pl-0 !pr-0 !px-0 w-full')
                  : cn('nav-link', collapsed && 'justify-center !pl-0 !pr-0 !px-0 w-full'),
              )}
              style={collapsed ? { padding: '0.625rem 0', width: '100%' } : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-150',
                  active && !adminOnly && 'scale-110',
                  'group-hover:scale-110'
                )}
                style={{ color: active && !adminOnly ? 'var(--accent-bright)' : undefined }}
              />
              {!collapsed && <span className="truncate">{label}</span>}

              {/* Unread badge */}
              {badge !== undefined && (
                <span
                  className={cn(
                    'flex items-center justify-center text-white text-[10px] font-bold rounded-full',
                    'bg-gradient-to-br from-olive-400 to-olive-600',
                    collapsed
                      ? 'absolute top-0.5 right-1 w-4 h-4 text-[9px]'
                      : 'ml-auto w-5 h-5',
                  )}
                  style={{ animation: 'badgePop 0.3s ease-out both' }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}

              {/* Collapsed tooltip */}
              {collapsed && (
                <div
                  className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                             opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                             transition-opacity duration-150 shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-card-el)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {label}
                  {badge ? ` (${badge})` : ''}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User account card ── */}
      <div
        className="mx-3 mb-3 mt-3 p-3 rounded-2xl flex-shrink-0"
        style={{
          backgroundColor: 'var(--bg-hover)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                style={{ border: '2px solid var(--border-accent)' }}
              />
              <span
                className="online-dot-sm absolute -bottom-0.5 -right-0.5"
                style={{ borderColor: 'var(--bg-hover)' }}
              />
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
              <img
                src={avatar}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover"
                style={{ border: '2px solid var(--border-accent)' }}
              />
              <span
                className="online-dot-sm online-dot-pulse absolute -bottom-0.5 -right-0.5"
                style={{ borderColor: 'var(--bg-hover)' }}
              />
            </div>
            {/* Name + username */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate leading-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
              >
                {displayName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                @{user?.username}
              </p>
            </div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 flex-shrink-0',
          collapsed ? 'w-[68px]' : 'w-[248px]',
        )}
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 z-50 w-6 h-6 rounded-full flex items-center justify-center
                     shadow-md transition-all duration-150 hover:scale-110"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronRight
            className={cn('w-3.5 h-3.5 transition-transform duration-300', collapsed ? '' : 'rotate-180')}
          />
        </button>

        <SidebarContent />
      </aside>

      {/* ── Mobile: top nav bar ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logopng.png" alt="Olive Logo" className="w-9 h-9 object-contain" />
          <span style={{ fontFamily: 'var(--font-heading)' }} className="font-bold text-olive-900 text-base">
            LetsDoTogether
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="relative w-[260px] h-full shadow-2xl animate-slide-up"
            style={{ backgroundColor: 'var(--bg-sidebar)' }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Mobile bottom bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderTop: '1px solid var(--border-subtle)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.slice(0, 5).map(({ to, icon: Icon, badge, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors"
              style={{ color: active ? 'var(--accent-bright)' : 'var(--text-muted)' }}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5 transition-transform duration-150', active && 'scale-110')} />
                {badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full bg-olive-500">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-bright)' }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
