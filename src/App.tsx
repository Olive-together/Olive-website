import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
// Initialise dark mode from persisted storage before first render
import '@/store/themeStore';
import Lenis from 'lenis';
import { lenisStore } from '@/lib/lenisStore';

// Layouts (keep these eager — they're tiny and needed immediately)
import { AppLayout }    from '@/components/AppLayout';
import { AdminLayout }  from '@/components/AdminLayout';
import { PublicLayout } from '@/components/PublicLayout';

// ── Lazy-load every page ───────────────────────────────────────────────────
const LandingPage           = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage             = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage            = lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage })));
const OAuthCallbackPage     = lazy(() => import('@/pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })));
const OnboardingPage        = lazy(() => import('@/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

// Public static pages
const HowItWorksPage        = lazy(() => import('@/pages/public/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const HelpPage              = lazy(() => import('@/pages/public/HelpPage').then(m => ({ default: m.HelpPage })));
const ContactPage           = lazy(() => import('@/pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const CommunityPage         = lazy(() => import('@/pages/public/CommunityPage').then(m => ({ default: m.CommunityPage })));
const RoadmapPage           = lazy(() => import('@/pages/public/RoadmapPage').then(m => ({ default: m.RoadmapPage })));
const FeatureRequestsPage   = lazy(() => import('@/pages/public/FeatureRequestsPage').then(m => ({ default: m.FeatureRequestsPage })));
const ContributePage        = lazy(() => import('@/pages/public/ContributePage').then(m => ({ default: m.ContributePage })));
const DocumentationPage     = lazy(() => import('@/pages/public/DocumentationPage').then(m => ({ default: m.DocumentationPage })));
const ChangelogPage         = lazy(() => import('@/pages/public/ChangelogPage').then(m => ({ default: m.ChangelogPage })));
const PrivacyPage           = lazy(() => import('@/pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage             = lazy(() => import('@/pages/public/TermsPage').then(m => ({ default: m.TermsPage })));
const SecurityPage          = lazy(() => import('@/pages/public/SecurityPage').then(m => ({ default: m.SecurityPage })));

// Admin pages
const AdminLoginPage        = lazy(() => import('@/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage    = lazy(() => import('@/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Authenticated user pages
const DashboardPage         = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ActivitiesPage        = lazy(() => import('@/pages/ActivitiesPage').then(m => ({ default: m.ActivitiesPage })));
const ActivityDetailPage    = lazy(() => import('@/pages/ActivityDetailPage').then(m => ({ default: m.ActivityDetailPage })));
const CreateActivityPage    = lazy(() => import('@/pages/CreateActivityPage').then(m => ({ default: m.CreateActivityPage })));
const PeoplePage            = lazy(() => import('@/pages/PeoplePage').then(m => ({ default: m.PeoplePage })));
const PersonDetailPage      = lazy(() => import('@/pages/PersonDetailPage').then(m => ({ default: m.PersonDetailPage })));
const MessagesPage          = lazy(() => import('@/pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const NotificationsPage     = lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ProfilePage           = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const EditProfilePage       = lazy(() => import('@/pages/EditProfilePage').then(m => ({ default: m.EditProfilePage })));
const SearchPage            = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })));
const SettingsPage          = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage          = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// ── Minimal page-level loading fallback ───────────────────────────────────
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-base, #faf8f3)' }}>
      <div className="flex flex-col items-center gap-4">
        <img src="/logopng.png" alt="Olive" className="w-12 h-12 object-contain animate-pulse" />
        <div className="w-32 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-subtle, #e8e3d6)' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8bb451, #6f9a35)',
              animation: 'indeterminate 1.2s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%) scaleX(1); }
          50%  { transform: translateX(60%)  scaleX(1.5); }
          100% { transform: translateX(250%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<LandingPage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/signup"        element={<SignupPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            {/* New user onboarding — standalone, no sidebar */}
            <Route path="/onboarding"    element={<OnboardingPage />} />
            {/* Public Static Info Pages */}
            <Route element={<PublicLayout />}>
              <Route path="/how-it-works"     element={<HowItWorksPage />} />
              <Route path="/help"             element={<HelpPage />} />
              <Route path="/contact"          element={<ContactPage />} />
              <Route path="/community"        element={<CommunityPage />} />
              <Route path="/roadmap"          element={<RoadmapPage />} />
              <Route path="/feature-requests" element={<FeatureRequestsPage />} />
              <Route path="/contribute"       element={<ContributePage />} />
              <Route path="/documentation"    element={<DocumentationPage />} />
              <Route path="/changelog"        element={<ChangelogPage />} />
              <Route path="/privacy"          element={<PrivacyPage />} />
              <Route path="/terms"            element={<TermsPage />} />
              <Route path="/security"         element={<SecurityPage />} />
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
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
