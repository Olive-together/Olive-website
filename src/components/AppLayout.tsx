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

  // Lenis v1.3.26 calls event.preventDefault() on wheel events even when lenis.stop()
  // is set (see lenis.mjs:613). The ONLY way to restore native scroll in overflow-y:auto
  // containers (Dashboard, Activities, etc.) is to fully destroy the Lenis instance so
  // its wheel listeners are removed. lenisStore.destroy() does this; recreate() restores
  // it when returning to public pages that need smooth-scroll.
  useEffect(() => {
    lenisStore.destroy();
    return () => { lenisStore.recreate(); };
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
          'flex-1 min-w-0',
          // Messages & chat need flex-col so the chat panel fills height properly
          (isMobileChatActive || isMessagesPage) && 'flex flex-col',
          isMobileChatActive
            ? 'p-0 overflow-hidden'
            : isMessagesPage
            ? 'pt-14 pb-16 lg:pt-0 lg:pb-0 overflow-hidden'
            // Standard pages: plain block scroll container — do NOT use flex-col here,
            // otherwise flex-1 children fill the exact height and overflow never triggers
            : 'pt-14 pb-16 lg:pt-0 lg:pb-0 overflow-y-auto',
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}


