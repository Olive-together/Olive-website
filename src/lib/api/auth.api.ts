import api from '@/lib/axios';
import type { AuthTokens, UserProfile } from './types';

export const authApi = {
  /** Register – requires email verification OTP after */
  register: (data: {
    email: string;
    username: string;
    password: string;
    dateOfBirth: string;
  }) => api.post<{ message: string }>('/auth/register', data).then((r) => r.data),

  /** Verify the 6-digit OTP sent to email */
  verifyEmail: (email: string, otp: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, otp }).then((r) => r.data),

  /** Resend OTP */
  resendVerification: (email: string) =>
    api.post<{ message: string }>('/auth/resend-verification', { email }).then((r) => r.data),

  /** Login with email + password → returns token pair */
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login', { email, password }).then((r) => r.data),

  /** Refresh access token using refresh token */
  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  /** Logout — revokes current session */
  logout: () => api.post('/auth/logout').then((r) => r.data),

  /** Get current authenticated user */
  getMe: () => api.get<UserProfile>('/users/me').then((r) => r.data),
};
