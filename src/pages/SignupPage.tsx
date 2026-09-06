import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, AtSign } from 'lucide-react';
import { authApi } from '@/lib/api/auth.api';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
  email: z.string().email('Enter a valid email'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, 'Must include a number and special character'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

// OTP verification step
function OtpStep({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(email, otp);
      onVerified();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(email);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 dot-pattern">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-olive-500 flex items-center justify-center shadow-btn">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900 text-xl">
            Olive
          </span>
        </div>
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📧</div>
            <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900 mb-1">Verify your email</h1>
            <p className="text-olive-500 text-sm">
              We sent a 6-digit code to <strong className="text-olive-700">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="input-field text-center text-2xl tracking-widest font-bold mb-4"
          />

          <button
            onClick={verify}
            disabled={otp.length !== 6 || loading}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : 'Verify Email'}
          </button>

          <button
            onClick={resend}
            disabled={resending}
            className="w-full mt-3 text-sm text-olive-500 hover:text-olive-700 transition-colors"
          >
            {resending ? 'Resending...' : "Didn't receive it? Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}

const benefits = [
  'Discover local activities and events',
  'Meet people who share your interests',
  'Join or create your own groups',
  'Build real-world friendships',
];

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.register({
        email: data.email,
        username: data.username,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      });
      // Move to OTP verification step
      setPendingEmail(data.email);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // After OTP verified, redirect to login
  const handleVerified = () => {
    navigate('/login', { state: { verified: true } });
  };

  if (pendingEmail) {
    return <OtpStep email={pendingEmail} onVerified={handleVerified} />;
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12 dot-pattern">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left panel */}
          <div className="hidden lg:block">
            <Link to="/" className="flex items-center gap-2.5 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-olive-500 flex items-center justify-center shadow-btn">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900 text-xl">
                Olive
              </span>
            </Link>
            <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-4xl text-olive-900 leading-tight mb-4">
              Start your journey <br />
              <span className="text-olive-500">today. 🌿</span>
            </h2>
            <p className="text-olive-600 mb-8">Join thousands of people who are discovering activities and building meaningful connections.</p>
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-olive-700">
                  <CheckCircle className="w-5 h-5 text-olive-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel — form */}
          <div className="card p-8">
            <div className="flex items-center justify-center gap-2.5 mb-6 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-olive-500 flex items-center justify-center shadow-btn">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-olive-900 text-lg">
                Olive
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-poppins)' }} className="font-bold text-2xl text-olive-900 text-center mb-1">Create your account</h1>
            <p className="text-center text-olive-500 text-sm mb-6">Free forever. No credit card required.</p>

            {/* Google */}
            <a
              href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/api/v1/auth/google`}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border-2 border-olive-100 hover:border-olive-300 hover:bg-olive-50 transition-all duration-200 mb-5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-olive-700">Sign up with Google</span>
            </a>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-olive-100" />
              <span className="text-xs text-olive-400 font-medium">or with email</span>
              <div className="flex-1 h-px bg-olive-100" />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('displayName')} type="text" placeholder="Sarah Johnson" className="input-field pl-10" />
                </div>
                {errors.displayName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.displayName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('username')} type="text" placeholder="sarah_j" className="input-field pl-10" />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-10" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Date of Birth <span className="text-olive-400 font-normal">(must be 18+)</span></label>
                <input {...register('dateOfBirth')} type="date" className="input-field" />
                {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars with number & symbol" className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="input-field pl-10" />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword.message}</p>}
              </div>

              <p className="text-xs text-olive-400">
                By signing up, you agree to our{' '}
                <a href="#" className="text-olive-600 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-olive-600 hover:underline">Privacy Policy</a>.
              </p>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-70">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account — Free 🌿'}
              </button>
            </form>

            <p className="text-center text-sm text-olive-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-olive-600 font-semibold hover:text-olive-800 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
