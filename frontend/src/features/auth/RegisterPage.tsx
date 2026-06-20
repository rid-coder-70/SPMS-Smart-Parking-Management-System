import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import type { RegisterPayload, VehicleType } from '@/common/types';

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
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

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      if (err.status === 409) {
        setError('Username or email is already taken.');
      } else {
        setError(err.message ?? 'Registration failed. Please check your inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-night-900 px-4">
        <div className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-white/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-night-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-sm text-white/50">Join SPMS and book your parking slots</p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Username *</label>
            <input
              name="username"
              type="text"
              required
              className="input"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Email Address *</label>
            <input
              name="email"
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="input pr-10"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/60"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="border-t border-night-700 my-4 pt-4">
            <h3 className="text-sm font-medium text-white mb-4">Vehicle Details (Optional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Vehicle Type</label>
                <select
                  name="vehicleType"
                  className="input"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {VEHICLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">License Plate / Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  type="text"
                  className="input"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-6"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
