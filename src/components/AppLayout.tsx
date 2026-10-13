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
    // Use 100dvh (dynamic viewport height) — when the mobile keyboard opens,
    // this container shrinks with the visual viewport instead of staying at
    // full screen height and causing the page to scroll up.
    <div
      className="flex"
      style={{
        backgroundColor: 'var(--bg-base)',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <Sidebar />
      {/* pt-14 = mobile top navbar; pb-16 = mobile bottom navbar; both removed on lg */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14 pb-16 lg:pt-0 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}


