import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';

/**
 * AppLayout — authenticated wrapper.
 *
 * Gate logic:
 * - Not authenticated → /login
 * - Authenticated but profile is brand-new (completenessScore === 0 AND no displayName AND no avatar)
 *   → /onboarding (only once; after completing onboarding, completenessScore > 0)
 * - Otherwise → render the app normally
 */
export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Detect brand-new / incomplete profile.
  // We check: no displayName AND no avatarUrl.
  // completenessScore is also a reliable signal if the backend sets it.
  // We avoid infinite redirect: don't redirect if already on /onboarding.
  const isNewUser =
    user &&
    !user.profile?.displayName &&
    !user.profile?.avatarUrl &&
    location.pathname !== '/onboarding';

  if (isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

