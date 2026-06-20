import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff } from 'lucide-react';
// ─── LoginPage ────────────────────────────────────────────────

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  // After login, go back to the page the user came from (or /profile)
  const from = (location.state as { from?: string })?.from ?? '/profile';

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };

      if (e.status === 423) {
        setError('Your account is temporarily locked due to too many failed attempts. Please try again later.');
      } else if (e.status === 401) {
        setError('Invalid username or password. Please check your credentials.');
      } else {
        setError(e.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-900 px-4 py-12 relative overflow-hidden">
      {/* Background removed for minimal style */}

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-night-900 font-bold text-3xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60">Sign in to access your SPMS dashboard</p>
        </div>

        {/* Card */}
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">

            {/* Inline error */}
            {error && (
              <div className="alert-error" role="alert">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="login-username" className="label">Username</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                required
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="btn-primary w-full mt-2"
            >
              {submitting ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50 relative z-10">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
