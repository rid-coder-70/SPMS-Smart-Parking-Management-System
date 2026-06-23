import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, AlertCircle, ParkingCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  const [username,    setUsername]    = useState('');
  const [password,    setPassword]   = useState('');
  const [error,       setError]       = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.status === 423) {
        setError('Account temporarily locked due to too many failed attempts.');
      } else if (err.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError(err.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFBF5' }}>

      {/* Subtle warm dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top warm glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(251,146,60,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-orange-100 bg-white">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-400/30">
            <ParkingCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">SPMS</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
            Manage parking<br />
            <span className="text-gradient-orange">effortlessly.</span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Real-time slot tracking, instant reservations, and automated billing — all in one place.
          </p>

          <div className="mt-10 space-y-3">
            {[
              'Reserve slots in advance',
              'One-tap check-in & check-out',
              'Automatic fee calculation',
              'Live occupancy dashboard',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-orange-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-300">Smart Parking Management System</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <ParkingCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">SPMS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert-error mb-6">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                className="input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-orange-500 transition-colors"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 py-2.5"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
