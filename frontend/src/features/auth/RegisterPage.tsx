import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join SPMS — Smart Parking Management System</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {error && <div className="alert-error" role="alert">{error}</div>}

            {/* Username */}
            <div>
              <label htmlFor="reg-username" className="label">Username <span className="text-red-500">*</span></label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                placeholder="e.g. ridoy_baidya"
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                className="input"
              />
              {fieldErrors.username && <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email <span className="text-red-500">*</span></label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="input"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
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

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password <span className="text-red-500">*</span></label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="input"
              />
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reg-confirm" className="label">Confirm Password <span className="text-red-500">*</span></label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                className="input"
              />
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Vehicle Info (optional)</p>

              {/* Vehicle type */}
              <div className="mb-4">
                <label htmlFor="reg-vehicle-type" className="label">Vehicle Type</label>
                <select
                  id="reg-vehicle-type"
                  value={form.vehicleType ?? ''}
                  onChange={(e) => set('vehicleType', (e.target.value as VehicleType) || undefined)}
                  className="input"
                >
                  <option value="">— Select type —</option>
                  {VEHICLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle number */}
              <div>
                <label htmlFor="reg-vehicle-number" className="label">Vehicle Number / Plate</label>
                <input
                  id="reg-vehicle-number"
                  type="text"
                  placeholder="e.g. DHA-1234"
                  value={form.vehicleNumber ?? ''}
                  onChange={(e) => set('vehicleNumber', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
