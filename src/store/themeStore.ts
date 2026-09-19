import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  darkMode: boolean;
  toggle: () => void;
  setDark: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggle: () =>
        set((s) => {
          const next = !s.darkMode;
          applyDark(next);
          return { darkMode: next };
        }),
      setDark: (val) => {
        applyDark(val);
        set({ darkMode: val });
      },
    }),
    { name: 'theme-storage' }
  )
);

function applyDark(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Apply on initial load (before React renders)
const stored = localStorage.getItem('theme-storage');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.darkMode) applyDark(true);
  } catch {}
}
