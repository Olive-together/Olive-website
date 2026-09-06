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
      // Read the one-time access token from cookie
      const match = document.cookie.match(/oauth_access_token=([^;]+)/);
      if (!match) {
        navigate('/login');
        return;
      }

      const accessToken = decodeURIComponent(match[1]);
      // Clear the cookie
      document.cookie = 'oauth_access_token=; Max-Age=0; path=/';

      try {
        // Temporarily store in localStorage so authApi.getMe() picks it up
        localStorage.setItem('access_token', accessToken);
        const user = await authApi.getMe();

        // We don't get a refresh token via cookie in this flow — store what we have
        const refreshToken = localStorage.getItem('refresh_token') ?? '';
        login(user, accessToken, refreshToken);
        navigate('/dashboard');
      } catch {
        localStorage.removeItem('access_token');
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
