import { useEffect } from 'react';
import { useChatUIStore } from '@/store/chatUIStore';

/**
 * useVisualViewport
 *
 * Tracks the actual visual viewport dimensions on mobile devices (especially iOS Safari
 * and Android browsers where the virtual keyboard shifts or resizes the screen).
 *
 * It binds `--visual-viewport-height` to documentElement and detects keyboard state
 * so layouts can adapt instantly without iOS Safari panning the whole document upward.
 */
export function useVisualViewport() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const setIsKeyboardOpen = useChatUIStore.getState().setIsKeyboardOpen;

    // Detect touch-capable mobile device — on desktop we never need to fight browser scroll behaviour
    const isMobile = () =>
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 1024;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      const offsetTop = vv ? vv.offsetTop : 0;
      const keyboardHeight = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
      const isKeyboardOpen = keyboardHeight > 120;

      // Update CSS custom properties for container height and keyboard-aware offset
      root.style.setProperty('--visual-viewport-height', `${height}px`);
      root.style.setProperty('--visual-viewport-offset-top', `${offsetTop}px`);
      root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      root.setAttribute('data-keyboard-open', isKeyboardOpen ? 'true' : 'false');

      setIsKeyboardOpen(isKeyboardOpen, keyboardHeight);

      // Only reset window scroll on mobile — desktop uses overflow-y-auto on the main element
      // and must NOT have its native scroll blocked.
      if (isMobile() && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    handleViewportChange();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
    }

    // Immediately revert any browser auto-scroll on mobile only, so the layout
    // doesn't get pushed up when the virtual keyboard opens.
    const handleWindowScroll = () => {
      if (isMobile() && window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('scroll', handleWindowScroll);
      root.style.removeProperty('--visual-viewport-height');
      root.style.removeProperty('--visual-viewport-offset-top');
      root.style.removeProperty('--keyboard-height');
      root.removeAttribute('data-keyboard-open');
    };
  }, []);
}
