import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '@/common/api';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  VehicleType,
} from '@/common/types';
import { Eye, EyeOff } from 'lucide-react';

// ─── Badge helpers ────────────────────────────────────────────

function AccountBadge({ status }: { status: string }) {
  const cls =
    status === 'ACTIVE'   ? 'badge-active'   :
    status === 'LOCKED'   ? 'badge-locked'   : 'badge-inactive';
  return <span className={cls}>{status}</span>;
}

function RoleBadge({ role }: { role: string }) {
  return <span className={role === 'ADMIN' ? 'badge-admin' : 'badge-user'}>{role}</span>;
}

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

// ─── ProfilePage ──────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── Profile update form ───────────────────────────────────
  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>({
    email:         user?.email         ?? '',
    phone:         user?.phone         ?? '',
    vehicleType:   user?.vehicleType,
    vehicleNumber: user?.vehicleNumber ?? '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Password change form ──────────────────────────────────
  const [pwForm, setPwForm] = useState<ChangePasswordPayload>({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync profile form when user state changes (e.g. after save)
  useEffect(() => {
    if (user) {
      setProfileForm({
        email:         user.email         ?? '',
        phone:         user.phone         ?? '',
        vehicleType:   user.vehicleType,
        vehicleNumber: user.vehicleNumber ?? '',
      });
    }
  }, [user]);

  // ── Save profile ──────────────────────────────────────────
  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      await api.put('/users/me', profileForm);
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setProfileMsg({ type: 'err', text: e.message ?? 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Change password ───────────────────────────────────────
  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: 'err', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPwSaving(true);
    try {
      await api.put('/users/me/password', pwForm);
      setPwMsg({ type: 'ok', text: 'Password changed. Please log in again.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Force re-login after password change
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setPwMsg({ type: 'err', text: e.message ?? 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-night-900 px-4 py-10 relative overflow-hidden">
      {/* Background removed for minimal style */}
      
      <div className="mx-auto max-w-2xl space-y-6 relative z-10">
        <div className="flex items-center">
          <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
        </div>

        {/* ── User Info Card ────────────────────────────── */}
        <div className="card animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{user.username}</h1>
              <p className="mt-1 text-sm text-white/60">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <RoleBadge role={user.role} />
              <AccountBadge status={user.accountStatus} />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-6">
            {[
              { label: 'User ID',       value: user.id },
              { label: 'Phone',         value: user.phone || '—' },
              { label: 'Vehicle Type',  value: user.vehicleType || '—' },
              { label: 'Plate Number',  value: user.vehicleNumber || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="font-medium text-white/50">{label}</dt>
                <dd className="mt-1 text-white font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-secondary mt-8 w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            Sign out
          </button>
        </div>

        {/* ── Update Profile Form ───────────────────────── */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="mb-6 text-xl font-bold text-white border-b border-white/10 pb-4">Update Profile</h2>

          {profileMsg && (
            <div className={profileMsg.type === 'ok' ? 'alert-success mb-4' : 'alert-error mb-4'}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="profile-email" className="label">Email</label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email ?? ''}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="profile-phone" className="label">Phone</label>
              <input
                id="profile-phone"
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={profileForm.phone ?? ''}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="profile-vehicle-type" className="label">Vehicle Type</label>
              <select
                id="profile-vehicle-type"
                value={profileForm.vehicleType ?? ''}
                onChange={(e) =>
                  setProfileForm((p) => ({
                    ...p,
                    vehicleType: (e.target.value as VehicleType) || undefined,
                  }))
                }
                className="input appearance-none bg-night-800/50"
              >
                <option value="" className="bg-night-800 text-white/50">— No change —</option>
                {VEHICLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-night-800 text-white">{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="profile-vehicle-number" className="label">Plate / Vehicle Number</label>
              <input
                id="profile-vehicle-number"
                type="text"
                placeholder="e.g. DHA-1234"
                value={profileForm.vehicleNumber ?? ''}
                onChange={(e) => setProfileForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
                className="input"
              />
            </div>

            <button type="submit" disabled={profileSaving} className="btn-primary">
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Change Password Form ──────────────────────── */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="mb-6 text-xl font-bold text-white border-b border-white/10 pb-4">Change Password</h2>

          {pwMsg && (
            <div className={pwMsg.type === 'ok' ? 'alert-success mb-4' : 'alert-error mb-4'}>
              {pwMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="pw-current" className="label">Current Password</label>
              <div className="relative">
                <input
                  id="pw-current"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="pw-new" className="label">New Password</label>
              <div className="relative">
                <input
                  id="pw-new"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/50 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="pw-confirm" className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  id="pw-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
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
            </div>

            <button
              type="submit"
              disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}
              className="btn-primary"
            >
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
