import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import type { RegisterPayload, VehicleType } from '@/common/types';

// ─── Helpers ──────────────────────────────────────────────────

const EMAIL_RE = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

// ─── RegisterPage ─────────────────────────────────────────────

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState<RegisterPayload>({
    username: '',
    email:    '',
    password: '',
    phone:    '',
    vehicleType:   undefined,
    vehicleNumber: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,     setError]     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterPayload | 'confirmPassword', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function set<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  // ── Client-side validation ────────────────────────────────
  function validate(): boolean {
    const errs: typeof fieldErrors = {};

    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'Minimum 3 characters';

    if (!form.email.trim())            errs.email = 'Email is required';
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Enter a valid email address';

    if (!form.password)                errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';

    if (form.password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate('/login', {
        state: { message: 'Account created! Please sign in.' },
        replace: true,
      });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 409) {
        setError(e.message ?? 'Username or email is already taken.');
      } else {
        setError(e.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-night-900 px-4 py-12 relative overflow-hidden">
      {/* Background removed for minimal style */}

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-night-900 font-bold text-3xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-white/60">Join SPMS — Smart Parking Management System</p>
        </div>

        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">

            {error && (
              <div className="alert-error" role="alert">
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Username */}
              <div className="sm:col-span-2">
                <label htmlFor="reg-username" className="label">Username <span className="text-brand-400">*</span></label>
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. ridoy_baidya"
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  className="input"
                />
                {fieldErrors.username && <p className="mt-1 ml-1 text-xs text-red-400">{fieldErrors.username}</p>}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="reg-email" className="label">Email <span className="text-brand-400">*</span></label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="input"
                />
                {fieldErrors.email && <p className="mt-1 ml-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="label">Password <span className="text-brand-400">*</span></label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
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
                {fieldErrors.password && <p className="mt-1 ml-1 text-xs text-red-400">{fieldErrors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="reg-confirm" className="label">Confirm Password <span className="text-brand-400">*</span></label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 ml-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label htmlFor="reg-phone" className="label flex items-center justify-between">
                  Phone
                  <span className="text-white/30 font-normal text-xs uppercase tracking-wider">Optional</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={form.phone ?? ''}
                  onChange={(e) => set('phone', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="pt-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white/30">Vehicle Info</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Vehicle type */}
                <div>
                  <label htmlFor="reg-vehicle-type" className="label">Type</label>
                  <select
                    id="reg-vehicle-type"
                    value={form.vehicleType ?? ''}
                    onChange={(e) => set('vehicleType', (e.target.value as VehicleType) || undefined)}
                    className="input appearance-none bg-night-800/50"
                  >
                    <option value="" className="bg-night-800 text-white/50">— Select —</option>
                    {VEHICLE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-night-800 text-white">{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle number */}
                <div>
                  <label htmlFor="reg-vehicle-number" className="label">License Plate</label>
                  <input
                    id="reg-vehicle-number"
                    type="text"
                    placeholder="e.g. DHA-1234"
                    value={form.vehicleNumber ?? ''}
                    onChange={(e) => set('vehicleNumber', e.target.value)}
                    className="input uppercase"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-4"
            >
              {submitting ? 'Creating account…' : 'Join SPMS'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50 relative z-10">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
