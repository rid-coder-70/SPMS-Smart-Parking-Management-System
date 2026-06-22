import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthService } from './auth.service';
import type { ChangePasswordPayload, UpdateProfilePayload, VehicleType } from '@/common/types';
import {
  Eye, EyeOff, User as UserIcon, Lock, Car, CheckCircle2, AlertCircle, Shield,
} from 'lucide-react';

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>({
    email:         user?.email         ?? '',
    phone:         user?.phone         ?? '',
    vehicleType:   user?.vehicleType   ?? 'STANDARD',
    vehicleNumber: user?.vehicleNumber ?? '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [pwForm, setPwForm] = useState<ChangePasswordPayload>({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwSaving,      setPwSaving]      = useState(false);
  const [pwMsg,         setPwMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw,     setShowNewPw]     = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        email:         user.email         ?? '',
        phone:         user.phone         ?? '',
        vehicleType:   user.vehicleType   ?? 'STANDARD',
        vehicleNumber: user.vehicleNumber ?? '',
      });
    }
  }, [user]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true); setProfileMsg(null);
    try {
      await AuthService.updateProfile(profileForm);
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err.message ?? 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true); setPwMsg(null);
    try {
      await AuthService.changePassword(pwForm);
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message ?? 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header / user card */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
          <UserIcon className="h-7 w-7 text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{user.username}</h1>
          <p className="text-sm text-white/40 truncate">{user.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
            {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
            {user.role}
          </span>
          <span className={`badge ${
            user.accountStatus === 'ACTIVE'
              ? 'badge-active'
              : user.accountStatus === 'LOCKED'
              ? 'badge-locked'
              : 'badge-inactive'
          }`}>
            {user.accountStatus}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Update Profile */}
        <div className="card">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-5 flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Profile Details
          </h2>

          {profileMsg && (
            <div className={`mb-5 ${profileMsg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
              {profileMsg.type === 'ok'
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <AlertCircle  className="h-4 w-4 shrink-0" />}
              <p>{profileMsg.text}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" required className="input"
                value={profileForm.email ?? ''}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel" className="input"
                placeholder="+880 1XXX-XXXXXX"
                value={profileForm.phone ?? ''}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-4 w-4 text-white/40" />
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Vehicle Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label">Vehicle Type</label>
                  <select
                    className="input"
                    value={profileForm.vehicleType ?? 'STANDARD'}
                    onChange={e => setProfileForm({ ...profileForm, vehicleType: e.target.value as VehicleType })}
                  >
                    {VEHICLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0f1629] text-white">{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">License Plate</label>
                  <input
                    type="text" className="input"
                    placeholder="e.g. DHA-1234"
                    value={profileForm.vehicleNumber ?? ''}
                    onChange={e => setProfileForm({ ...profileForm, vehicleNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={profileSaving} className="btn-primary w-full mt-2 py-2.5">
              {profileSaving
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Saving…</>
                : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </h2>

          {pwMsg && (
            <div className={`mb-5 ${pwMsg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
              {pwMsg.type === 'ok'
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <AlertCircle  className="h-4 w-4 shrink-0" />}
              <p>{pwMsg.text}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required className="input pr-10"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                />
                <button type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}>
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required className="input pr-10"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                />
                <button type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
                  onClick={() => setShowNewPw(!showNewPw)}>
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                required className="input"
                value={pwForm.confirmPassword ?? ''}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
              />
            </div>

            <button type="submit" disabled={pwSaving} className="btn-primary w-full mt-2 py-2.5">
              {pwSaving
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Updating…</>
                : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
