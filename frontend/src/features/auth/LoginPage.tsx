import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// ─── LoginPage ────────────────────────────────────────────────

export default function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  // After login, go back to the page the user came from (or /)
  const from = (location.state as { from?: string })?.from ?? '/';

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to SPMS</h1>
          <p className="mt-1 text-sm text-gray-500">Smart Parking Management System</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Inline error */}
            {error && (
              <div className="alert-error" role="alert">
                {error}
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
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="btn-primary w-full"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Register
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
