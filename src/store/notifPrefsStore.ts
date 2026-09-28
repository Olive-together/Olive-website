import { create } from 'zustand';
import { notificationsApi, type UpdateNotifPrefsDto } from '@/lib/api/notifications.api';

export interface NotificationPrefs {
  activityJoins: boolean;
  connectionRequests: boolean;
  messages: boolean;
  activityReminders: boolean;
  recommendations: boolean;
  ratings: boolean;
}

interface NotifPrefsState {
  prefs: NotificationPrefs;
  loaded: boolean;
  saving: boolean;

  /** Load prefs from backend — call on app startup / Settings page mount */
  loadPrefs: () => Promise<void>;

  /** Toggle a single pref and immediately persist to backend */
  setPref: (key: keyof NotificationPrefs, val: boolean) => Promise<void>;

  /** Set all prefs to val and persist to backend */
  resetAll: (val: boolean) => Promise<void>;
}

const defaults: NotificationPrefs = {
  activityJoins: true,
  connectionRequests: true,
  messages: true,
  activityReminders: true,
  recommendations: false,
  ratings: true,
};

export const useNotifPrefsStore = create<NotifPrefsState>()((set, get) => ({
  prefs: defaults,
  loaded: false,
  saving: false,

  loadPrefs: async () => {
    try {
      const data = await notificationsApi.getPrefs();
      set({
        prefs: {
          activityJoins:      data.activityJoins,
          connectionRequests: data.connectionRequests,
          messages:           data.messages,
          activityReminders:  data.activityReminders,
          recommendations:    data.recommendations,
          ratings:            data.ratings,
        },
        loaded: true,
      });
    } catch {
      // Fail silently — use local defaults
      set({ loaded: true });
    }
  },

  setPref: async (key, val) => {
    // Optimistic update
    set((s) => ({ prefs: { ...s.prefs, [key]: val }, saving: true }));
    try {
      const updated = await notificationsApi.updatePrefs({ [key]: val } as UpdateNotifPrefsDto);
      set({
        prefs: {
          activityJoins:      updated.activityJoins,
          connectionRequests: updated.connectionRequests,
          messages:           updated.messages,
          activityReminders:  updated.activityReminders,
          recommendations:    updated.recommendations,
          ratings:            updated.ratings,
        },
        saving: false,
      });
    } catch {
      // Revert on failure
      set((s) => ({ prefs: { ...s.prefs, [key]: !val }, saving: false }));
    }
  },

  resetAll: async (val) => {
    const allSame: NotificationPrefs = Object.fromEntries(
      Object.keys(defaults).map((k) => [k, val])
    ) as unknown as NotificationPrefs;

    // Optimistic update
    set({ prefs: allSame, saving: true });
    try {
      const updated = await notificationsApi.updatePrefs(allSame);
      set({
        prefs: {
          activityJoins:      updated.activityJoins,
          connectionRequests: updated.connectionRequests,
          messages:           updated.messages,
          activityReminders:  updated.activityReminders,
          recommendations:    updated.recommendations,
          ratings:            updated.ratings,
        },
        saving: false,
      });
    } catch {
      // Revert on failure — reload from server
      get().loadPrefs();
      set({ saving: false });
    }
  },
}));
