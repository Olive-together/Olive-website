import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function AdminLoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);

  // If already logged in as admin, go straight to admin dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await authApi.login(data.email, data.password);
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      const me = await authApi.getMe();

      if (me.role !== 'ADMIN') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setError('Access denied. This portal is for administrators only.');
        return;
      }

      login(me, tokens.accessToken, tokens.refreshToken);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a2233 100%)',
        fontFamily: 'var(--font-inter)',
      }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(111,154,53,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(111,154,53,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header badge */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(111,154,53,0.1)', borderColor: 'rgba(111,154,53,0.3)', color: '#8bb451' }}
          >
            <Shield className="w-3.5 h-3.5" />
            Restricted Access
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 border"
          style={{
            background: '#161b22',
            borderColor: '#30363d',
            boxShadow: '0 0 60px rgba(111,154,53,0.08), 0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #6f9a35, #435e21)',
                boxShadow: '0 8px 24px rgba(111,154,53,0.3)',
              }}
            >
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-white text-2xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Admin Portal
            </h1>
            <p className="text-sm text-center" style={{ color: '#8b949e' }}>
              Olive Control Centre — authorised personnel only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 p-3.5 rounded-2xl flex items-start gap-3 text-sm border"
              style={{ background: 'rgba(248,81,73,0.1)', borderColor: 'rgba(248,81,73,0.3)', color: '#f85149' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b949e' }}>
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="username"
                  placeholder="admin@letsdotogether.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: '#0d1117',
                    border: '1.5px solid #30363d',
                    color: '#e6edf3',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#6f9a35'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#30363d'; }}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#f85149' }}>
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8b949e' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b949e' }} />
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: '#0d1117',
                    border: '1.5px solid #30363d',
                    color: '#e6edf3',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#6f9a35'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#30363d'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: '#8b949e' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#8bb451')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8b949e')}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#f85149' }}>
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#435e21' : 'linear-gradient(135deg, #6f9a35, #435e21)',
                color: 'white',
                fontFamily: 'var(--font-poppins)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(111,154,53,0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Access Control Centre
                </span>
              )}
            </button>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-xs mt-6" style={{ color: '#484f58' }}>
            All admin actions are logged and auditable.
            <br />
            Unauthorised access attempts are monitored.
          </p>
        </div>

        {/* Back to app */}
        <p className="text-center mt-5 text-xs" style={{ color: '#484f58' }}>
          Regular user?{' '}
          <a href="/login" style={{ color: '#8b949e' }} className="hover:underline">
            Go to main login →
          </a>
        </p>
      </div>
    </div>
  );
}
