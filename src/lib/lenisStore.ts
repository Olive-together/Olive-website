/**
 * Tiny shared store so any component can pause / resume the global Lenis instance.
 * Lenis is created in App.tsx and registered here so MessagesPage (and any other
 * full-screen panel) can stop it from intercepting their internal scroll containers.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _lenis: any = null;

export const lenisStore = {
  set(instance: unknown) {
    _lenis = instance;
  },
  pause() {
    _lenis?.stop?.();
  },
  resume() {
    _lenis?.start?.();
  },
};
