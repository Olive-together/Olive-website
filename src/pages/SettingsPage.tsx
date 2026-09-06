import { useAuthStore } from '@/store/authStore';
import { LogOut, Shield, Bell, Moon, Globe, ChevronRight, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { LucideIcon } from 'lucide-react';

interface SettingsItem {
  icon: LucideIcon;
  label: string;
  desc: string;
  toggle?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Account',
    items: [
      { icon: Shield, label: 'Privacy & Security', desc: 'Manage your account privacy' },
      { icon: Bell, label: 'Notification Preferences', desc: 'Control what you hear about' },
      { icon: Globe, label: 'Language & Region', desc: 'English (US)' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { icon: Moon, label: 'Dark Mode', desc: 'Coming soon 🌙', toggle: true },
    ],
  },
];

export function SettingsPage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full animate-fade-in">
      <h1 className="page-title mb-8">Settings ⚙️</h1>

      {settingsSections.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="text-xs font-bold text-olive-500 uppercase tracking-wider mb-3 px-1">{section.title}</h2>
          <div className="card divide-y divide-olive-100">
            {section.items.map(({ icon: Icon, label, desc, toggle }) => (
              <div key={label} className="flex items-center justify-between px-5 py-4 hover:bg-olive-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-olive-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-olive-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-olive-900">{label}</p>
                    <p className="text-xs text-olive-500">{desc}</p>
                  </div>
                </div>
                {toggle ? (
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-olive-500' : 'bg-olive-200'} relative`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
                  </button>
                ) : (
                  <ChevronRight className="w-4 h-4 text-olive-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-olive-500 uppercase tracking-wider mb-3 px-1">Account Actions</h2>
        <div className="card">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 transition-colors rounded-3xl"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-600" />
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
          <Leaf className="w-4 h-4 text-olive-500" />
          <span className="font-poppins font-bold text-olive-700">Olive</span>
        </div>
        <p className="text-xs text-olive-400">v1.0.0 · Made with 🌿</p>
      </div>
    </div>
  );
}
