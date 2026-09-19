import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
// Initialise dark mode from persisted storage before first render
import '@/store/themeStore';


// Layouts
import { AppLayout }   from '@/components/AppLayout';
import { AdminLayout } from '@/components/AdminLayout';

// Public pages
import { LandingPage }  from '@/pages/LandingPage';
import { LoginPage }    from '@/pages/LoginPage';
import { SignupPage }   from '@/pages/SignupPage';

// Admin pages
import { AdminLoginPage }     from '@/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';

// Authenticated user pages
import { DashboardPage }       from '@/pages/DashboardPage';
import { ActivitiesPage }      from '@/pages/ActivitiesPage';
import { ActivityDetailPage }  from '@/pages/ActivityDetailPage';
import { CreateActivityPage }  from '@/pages/CreateActivityPage';
import { PeoplePage }          from '@/pages/PeoplePage';
import { PersonDetailPage }    from '@/pages/PersonDetailPage';
import { MessagesPage }        from '@/pages/MessagesPage';
import { NotificationsPage }   from '@/pages/NotificationsPage';
import { ProfilePage }         from '@/pages/ProfilePage';
import { EditProfilePage }     from '@/pages/EditProfilePage';
import { SearchPage }          from '@/pages/SearchPage';
import { SettingsPage }        from '@/pages/SettingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/signup"       element={<SignupPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* ── Admin Portal ─────────────────────────────────────────────
               Completely isolated from the regular app.
               /admin/login  — separate login page (ADMIN credentials only)
               /admin        — activities monitor dashboard
          ──────────────────────────────────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Regular authenticated routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard"           element={<DashboardPage />} />
            <Route path="/activities"          element={<ActivitiesPage />} />
            <Route path="/activities/create"   element={<CreateActivityPage />} />
            <Route path="/activities/:id"      element={<ActivityDetailPage />} />
            <Route path="/people"              element={<PeoplePage />} />
            <Route path="/people/:username"    element={<PersonDetailPage />} />
            <Route path="/messages"            element={<MessagesPage />} />
            <Route path="/notifications"       element={<NotificationsPage />} />
            <Route path="/profile"             element={<ProfilePage />} />
            <Route path="/profile/edit"        element={<EditProfilePage />} />
            <Route path="/search"              element={<SearchPage />} />
            <Route path="/settings"            element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
