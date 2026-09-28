import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
// Initialise dark mode from persisted storage before first render
import '@/store/themeStore';


// Layouts
import { AppLayout }   from '@/components/AppLayout';
import { AdminLayout } from '@/components/AdminLayout';

// Public pages
import { PublicLayout } from '@/components/PublicLayout';
import { LandingPage }  from '@/pages/LandingPage';
import { LoginPage }    from '@/pages/LoginPage';
import { SignupPage }   from '@/pages/SignupPage';

import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { HelpPage } from '@/pages/public/HelpPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { CommunityPage } from '@/pages/public/CommunityPage';
import { RoadmapPage } from '@/pages/public/RoadmapPage';
import { FeatureRequestsPage } from '@/pages/public/FeatureRequestsPage';
import { ContributePage } from '@/pages/public/ContributePage';
import { DocumentationPage } from '@/pages/public/DocumentationPage';
import { ChangelogPage } from '@/pages/public/ChangelogPage';
import { PrivacyPage } from '@/pages/public/PrivacyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { SecurityPage } from '@/pages/public/SecurityPage';

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
import { NotFoundPage }        from '@/pages/NotFoundPage';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { lenisStore } from '@/lib/lenisStore';

export default function App() {
  useEffect(() => {
    // 1. Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisStore.set(lenis);

    let frameId = 0;

    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    // 2. Setup scroll reveal Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05, // trigger as soon as 5% is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    // Initial observation of all elements with .reveal-on-scroll
    const observeElements = () => {
      document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    observeElements();

    // Since this is a React SPA, watch for dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            const el = node as Element;
            if (el.classList && el.classList.contains('reveal-on-scroll')) {
              observer.observe(el);
            }
            if (el.querySelectorAll) {
              el.querySelectorAll('.reveal-on-scroll').forEach((child) => {
                observer.observe(child);
              });
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/signup"       element={<SignupPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          {/* Public Static Info Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/feature-requests" element={<FeatureRequestsPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/security" element={<SecurityPage />} />
          </Route>
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

          {/* 404 — custom branded page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
