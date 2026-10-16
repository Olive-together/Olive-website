import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useChatUIStore } from '@/store/chatUIStore';
import { useVisualViewport } from '@/lib/useVisualViewport';
import { lenisStore } from '@/lib/lenisStore';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

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

  // Track virtual viewport for mobile devices to handle keyboard gracefully
  useVisualViewport();

  // All authenticated pages use their own overflow-y-auto containers, so the global
  // Lenis smooth-scroll (which targets document.documentElement) must be paused here.
  // Without this, Lenis intercepts wheel events and prevents mouse/touchpad scrolling
  // inside the <main> overflow container (dashboard, activities, etc.).
  useEffect(() => {
    lenisStore.pause();
    return () => { lenisStore.resume(); };
  }, []);

  const activeConvId = useChatUIStore((s) => s.activeConversationId);
  const isMessagesPage = location.pathname.startsWith('/messages');
  const isMobileChatActive = isMessagesPage && Boolean(activeConvId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Detect brand-new / incomplete profile.
  const isNewUser =
    user &&
    !user.profile?.displayName &&
    !user.profile?.avatarUrl &&
    location.pathname !== '/onboarding';

  if (isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div
      className="flex"
      style={{
        backgroundColor: 'var(--bg-base)',
        position: 'fixed',
        top: 'var(--visual-viewport-offset-top, 0px)',
        left: 0,
        right: 0,
        height: 'var(--visual-viewport-height, 100dvh)',
        overflow: 'hidden',
      }}
    >
      <Sidebar />
      {/* 
        - When inside an active mobile chat conversation: 
          Remove top/bottom padding completely so the chat header and composer sit full-bleed.
        - On conversation list: 
          Keep top/bottom bar padding, but lock main's overflow so only the list scrolls.
        - On standard pages: 
          Allow normal vertical scrolling on main.
      */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0',
          isMobileChatActive
            ? 'p-0 overflow-hidden'
            : isMessagesPage
            ? 'pt-14 pb-16 lg:pt-0 lg:pb-0 overflow-hidden'
            : 'pt-14 pb-16 lg:pt-0 lg:pb-0 overflow-y-auto',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}


