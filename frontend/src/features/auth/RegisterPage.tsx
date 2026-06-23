import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ParkingCircle, ArrowRight, Car, Zap, Shield, Bike, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RegisterPayload, VehicleType } from '@/common/types';

const VEHICLE_OPTIONS: { value: VehicleType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'STANDARD',   label: 'Standard Car',   desc: 'Sedan, hatchback',     icon: <Car className="h-4 w-4" /> },
  { value: 'MOTORCYCLE', label: 'Motorcycle',      desc: 'Bike or scooter',      icon: <Bike className="h-4 w-4" /> },
  { value: 'LARGE',      label: 'Large Vehicle',   desc: 'SUV, van or truck',    icon: <Truck className="h-4 w-4" /> },
];

const FEATURES = [
  { icon: <Zap className="h-4 w-4 text-orange-500" />,   text: 'Instant slot reservation' },
  { icon: <Car className="h-4 w-4 text-yellow-500" />,    text: 'One-tap check-in & check-out' },
  { icon: <Shield className="h-4 w-4 text-orange-600" />, text: 'Secure JWT-authenticated sessions' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState<RegisterPayload>({
    username:      '',
    email:         '',
    password:      '',
    phone:         '',
    vehicleType:   'STANDARD',
    vehicleNumber: '',
  });

  const [error,      setError]      = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err: any) {
      if (err.status === 409) {
        setError('Username or email is already taken.');
      } else {
        setError(err.message ?? 'Registration failed. Please check your details.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFBF5' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-8"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────
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

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden border-r border-orange-100 flex-shrink-0 bg-white">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 20% 60%, rgba(249,115,22,0.06) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-400/30">
            <ParkingCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">SPMS</span>
        </div>

        {/* Middle copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Free to get started
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
            Your parking,<br />
            <span className="text-gradient-orange">automated.</span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Join SPMS and manage parking reservations, billing, and check-in with a single account.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                {f.text}
              </div>
            ))}
          </div>

          {/* Decorative stat row */}
          <div className="mt-10 flex gap-6">
            {[
              { label: 'Active Lots',  value: '12+' },
              { label: 'Slots',        value: '500+' },
              { label: 'Uptime',       value: '99.9%' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg font-black text-orange-500">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-300">Smart Parking Management System</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 overflow-y-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <ParkingCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">SPMS</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Fill in the details below to get started</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error mb-5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* ── Account credentials ── */}
            <div>
              <label className="label">Username</label>
              <input
                id="reg-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="input"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  className="input pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
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

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px bg-orange-100" />
              <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                <Car className="h-3 w-3" /> Vehicle info
                <span className="text-gray-300">(optional)</span>
              </span>
              <div className="flex-1 h-px bg-orange-100" />
            </div>

            {/* ── Vehicle details ── */}
            <div>
              <label className="label">Phone Number</label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div>
              <label className="label">Vehicle Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  {VEHICLE_OPTIONS.find(o => o.value === formData.vehicleType)?.icon}
                </div>
                <select
                  id="reg-vehicleType"
                  name="vehicleType"
                  className="input pl-10"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {VEHICLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">License Plate</label>
              <input
                id="reg-vehicleNumber"
                name="vehicleNumber"
                type="text"
                className="input"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g. DHA-1234"
              />
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              id="register-submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
