/**
 * Tiny shared store so any component can destroy / recreate the global Lenis instance.
 *
 * IMPORTANT: Lenis v1.3.26 calls event.preventDefault() even when lenis.stop() is set.
 * (see lenis.mjs line 613-614: `if (this.isStopped || this.isLocked) event.preventDefault()`)
 * This means stop()/start() is NOT sufficient — we must fully destroy the instance to
 * restore native scroll behaviour inside overflow-y:auto containers (Dashboard etc.).
 */

import type Lenis from 'lenis';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _lenis: any = null;
let _factory: (() => Lenis) | null = null;

export const lenisStore = {
  /** Register the active Lenis instance */
  set(instance: Lenis) {
    _lenis = instance;
  },

  /** Register a factory so we can recreate Lenis after destroying it */
  setFactory(factory: () => Lenis) {
    _factory = factory;
  },

  /**
   * Destroy Lenis entirely — removes all its wheel/touch listeners including the
   * ones that call preventDefault even when "stopped". Call this in any layout that
   * uses its own overflow-y:auto scroll containers.
   */
  destroy() {
    if (_lenis) {
      _lenis.destroy();
      _lenis = null;
    }
  },

  /**
   * Recreate Lenis from the stored factory. Call this when returning to public pages
   * that rely on document-level smooth scroll.
   */
  recreate() {
    if (!_lenis && _factory) {
      _lenis = _factory();
    }
  },

  /** Legacy helpers kept for backward compatibility */
  pause() { this.destroy(); },
  resume() { this.recreate(); },
};
