import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useNotifPrefsStore } from '@/store/notifPrefsStore';
import {
  LogOut, Shield, Bell, Moon, ChevronRight, Leaf,
  Activity, Link2, MessageSquare, Clock, Sparkles, Star,
  ChevronDown, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import type { NotificationPrefs } from '@/store/notifPrefsStore';

// ── Reusable toggle ─────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  size = 'md',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
}) {
  const trackW = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const thumbW = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const travel = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        trackW,
        'relative rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-400 focus-visible:ring-offset-2',
        'transition-colors duration-300',
        checked ? 'bg-olive-500' : 'bg-olive-200'
      )}
      style={{ flexShrink: 0 }}
    >
      <span
        className={cn(
          thumbW,
          'absolute top-0.5 left-0.5 bg-white rounded-full shadow-md',
          'transition-transform duration-300',
          checked ? travel : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ── Notification row labels ─────────────────────────────────────────────────
const notifItems: {
  key: keyof NotificationPrefs;
  icon: React.ElementType;
  label: string;
  desc: string;
}[] = [
  { key: 'activityJoins',       icon: Activity,      label: 'Activity Joins',        desc: 'When someone joins your activity' },
  { key: 'connectionRequests',  icon: Link2,         label: 'Connection Requests',   desc: 'Friend & connection requests' },
  { key: 'messages',            icon: MessageSquare, label: 'New Messages',          desc: 'Direct & group chat messages' },
  { key: 'activityReminders',   icon: Clock,         label: 'Activity Reminders',    desc: 'Reminders before your activities' },
  { key: 'recommendations',     icon: Sparkles,      label: 'Recommendations',       desc: 'Suggested people & activities' },
  { key: 'ratings',             icon: Star,          label: 'Ratings & Reviews',     desc: 'When you receive a rating' },
];

// ── Main page ───────────────────────────────────────────────────────────────
export function SettingsPage() {
  const logout        = useAuthStore((s) => s.logout);
  const navigate      = useNavigate();
  const { darkMode, toggle: toggleDark } = useThemeStore();
  const { prefs, setPref, resetAll, loaded, saving, loadPrefs } = useNotifPrefsStore();

  const [notifOpen, setNotifOpen] = useState(false);

  // Load prefs from backend on mount
  useEffect(() => {
    if (!loaded) loadPrefs();
  }, [loaded, loadPrefs]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allOn  = Object.values(prefs).every(Boolean);
  const allOff = Object.values(prefs).every((v) => !v);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full animate-fade-in">
      <h1 className="page-title mb-8">Settings ⚙️</h1>

      {/* ── ACCOUNT ── */}
      <div className="mb-6">
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Account
        </h2>

        <div className="card divide-y" style={{ borderColor: 'var(--border-subtle)' }}>

          {/* Privacy & Security */}
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer rounded-t-3xl"
            style={{ transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-badge)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Privacy &amp; Security</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manage your account privacy</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Notification Preferences — expandable */}
          <div>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer text-left"
              style={{ transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-badge)' }}>
                  <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notification Preferences</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {saving ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                    </span>
                  ) : !loaded ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                    </span>
                  ) : (
                    `${Object.values(prefs).filter(Boolean).length} of ${notifItems.length} enabled`
                  )}
                </p>
                </div>
              </div>
              <ChevronDown
                className="w-4 h-4 transition-transform duration-300"
                style={{
                  color: 'var(--text-muted)',
                  transform: notifOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Expandable panel */}
            <div
              style={{
                maxHeight: notifOpen ? '600px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div
                className="mx-4 mb-4 rounded-2xl border"
                style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }}
              >
                {/* Enable all / Disable all */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Quick actions</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resetAll(true)}
                      disabled={allOn}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200',
                        allOn
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:scale-105 active:scale-95'
                      )}
                      style={{
                        backgroundColor: 'var(--bg-badge)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> All on
                    </button>
                    <button
                      onClick={() => resetAll(false)}
                      disabled={allOff}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200',
                        allOff
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:scale-105 active:scale-95'
                      )}
                      style={{
                        backgroundColor: 'var(--bg-badge)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <XCircle className="w-3 h-3" /> All off
                    </button>
                  </div>
                </div>

                {/* Individual toggles */}
                {notifItems.map(({ key, icon: Icon, label, desc }, idx) => (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between px-4 py-3',
                      idx < notifItems.length - 1 ? 'border-b' : ''
                    )}
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--bg-badge)' }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                    </div>
                    <Toggle
                      size="sm"
                      checked={prefs[key]}
                      onChange={(v) => setPref(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── APPEARANCE ── */}
      <div className="mb-6">
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Appearance
        </h2>

        <div className="card">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-badge)' }}>
                <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {darkMode ? 'Currently dark 🌙' : 'Currently light ☀️'}
                </p>
              </div>
            </div>
            <Toggle checked={darkMode} onChange={toggleDark} />
          </div>
        </div>
      </div>

      {/* ── ACCOUNT ACTIONS ── */}
      <div className="mb-6">
        <h2
          className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Account Actions
        </h2>
        <div className="card">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-500/10 transition-colors rounded-3xl"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Log Out</p>
              <p className="text-xs text-red-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="font-bold" style={{ fontFamily: 'var(--font-poppins)', color: 'var(--text-secondary)' }}>Olive</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>v1.0.0 · Made with 🌿</p>
      </div>
    </div>
  );
}
