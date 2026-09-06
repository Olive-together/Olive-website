import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, CalendarDays, Users, MessageCircle, Bell,
  User, Search, Settings, LogOut, Leaf, Menu, X,
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

  const navItems = baseNavItems.map((item) => ({
    ...item,
    badge: item.to === '/notifications' && unreadCount > 0 ? unreadCount : undefined,
  }));

  const displayName = user?.profile?.displayName ?? user?.username ?? 'User';
  const avatar = user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors — still clear local state
    }
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/" className={cn('flex items-center gap-3 px-4 py-5 mb-2', collapsed && 'justify-center')}>
        <img src="/logopng.png" alt="Olive Logo" className="w-12 h-12 object-contain flex-shrink-0" />
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900 text-lg leading-tight">
            Olive
          </span>
        )}
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, badge }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 relative group',
                active
                  ? 'bg-olive-100 text-olive-800 font-semibold'
                  : 'text-olive-600 hover:bg-olive-50 hover:text-olive-800',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {badge !== undefined && (
                <span className={cn(
                  'ml-auto bg-olive-500 text-white text-xs font-bold rounded-full flex items-center justify-center',
                  collapsed ? 'absolute top-1 right-1 w-4 h-4 text-[9px]' : 'w-5 h-5'
                )}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-olive-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="px-3 py-4 border-t border-olive-100">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full ring-2 ring-olive-200 flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-olive-900 truncate">{displayName}</p>
              <p className="text-xs text-olive-500 truncate">@{user?.username}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl hover:bg-red-50 text-olive-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-white border-r border-olive-100 h-screen sticky top-0 transition-all duration-300 z-40',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-olive-200 rounded-full flex items-center justify-center shadow-sm hover:bg-olive-50 transition-all z-50"
        >
          <Menu className="w-3 h-3 text-olive-500" />
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile: top nav bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-olive-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logopng.png" alt="Olive Logo" className="w-10 h-10 object-contain" />
          <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900 text-base">
            Olive
          </span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-olive-50">
          {mobileOpen ? <X className="w-5 h-5 text-olive-700" /> : <Menu className="w-5 h-5 text-olive-700" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="bg-black/30 absolute inset-0" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[240px] bg-white h-full shadow-2xl animate-slide-up">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-olive-100 flex">
        {navItems.slice(0, 5).map(({ to, icon: Icon, badge, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 relative transition-colors',
                active ? 'text-olive-600' : 'text-olive-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
              {badge !== undefined && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-olive-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
