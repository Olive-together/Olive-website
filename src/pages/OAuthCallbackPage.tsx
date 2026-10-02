import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';

/**
 * Google OAuth callback handler.
 * The backend sets `oauth_access_token` cookie (readable JS, 1min TTL).
 * We pick it up, fetch /users/me, then store in authStore.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const pick = async () => {
      // Read tokens from URL query string
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken) {
        navigate('/login');
        return;
      }

      // Clean up the URL so tokens aren't left in browser history
      window.history.replaceState({}, document.title, window.location.pathname);

      try {
        // Temporarily store in localStorage so authApi.getMe() picks it up
        localStorage.setItem('access_token', accessToken);
        const user = await authApi.getMe();

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        login(user, accessToken, refreshToken || '');
        
        // Redirect new users (no display name or avatar) to onboarding
        const isNewUser = !user.profile?.displayName && !user.profile?.avatarUrl;
        navigate(isNewUser ? '/onboarding' : '/dashboard');
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }
    };

    pick();
  }, [login, navigate]);

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center dot-pattern">
      <div className="text-center">
        <span className="w-12 h-12 border-4 border-olive-200 border-t-olive-500 rounded-full animate-spin inline-block mb-4" />
        <p className="text-olive-600 font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
}
