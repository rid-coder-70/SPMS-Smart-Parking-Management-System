import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AuthService } from './auth.service';
import type { ChangePasswordPayload, UpdateProfilePayload, VehicleType } from '@/common/types';
import { Eye, EyeOff, User as UserIcon, Lock, Car, CheckCircle, AlertCircle } from 'lucide-react';

function AccountBadge({ status }: { status: string }) {
  const cls =
    status === 'ACTIVE'   ? 'bg-green-500/10 border-green-500/30 text-green-400' :
    status === 'LOCKED'   ? 'bg-red-500/10 border-red-500/30 text-red-400'       : 
    'bg-gray-500/10 border-gray-500/30 text-gray-400';
  return <span className={`badge ${cls}`}>{status}</span>;
}

function RoleBadge({ role }: { role: string }) {
  const cls = role === 'ADMIN' 
    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 font-bold' 
    : 'bg-blue-500/10 border-blue-500/30 text-blue-300';
  return <span className={`badge ${cls}`}>{role}</span>;
}

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  
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
    setProfileSaving(true);
    setProfileMsg(null);
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
    setPwSaving(true);
    setPwMsg(null);
    try {
      await AuthService.changePassword(pwForm);
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.message ?? 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <div className="flex items-center gap-2 mt-2">
              <RoleBadge role={user.role} />
              <AccountBadge status={user.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Profile Settings Form */}
        <section className="card">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="h-5 w-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Profile Details</h2>
          </div>

          {profileMsg && (
            <div className={`mb-6 ${profileMsg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
              {profileMsg.type === 'ok' ? (
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <p>{profileMsg.text}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                className="input"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t border-night-700">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-4 w-4 text-brand-400" />
                <h3 className="font-semibold text-white">Vehicle Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Vehicle Type</label>
                  <select
                    className="input"
                    value={profileForm.vehicleType}
                    onChange={e => setProfileForm({ ...profileForm, vehicleType: e.target.value as VehicleType })}
                  >
                    {VEHICLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">License Plate</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.vehicleNumber}
                    onChange={e => setProfileForm({ ...profileForm, vehicleNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={profileSaving} className="btn-primary w-full mt-6">
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="card h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>

          {pwMsg && (
            <div className={`mb-6 ${pwMsg.type === 'ok' ? 'alert-success' : 'alert-error'}`}>
              {pwMsg.type === 'ok' ? (
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <p>{pwMsg.text}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={pwSaving} className="btn-primary w-full mt-2">
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
