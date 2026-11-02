import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Lock, CheckCircle, Loader2, Key } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import * as userService from '../../services/user.service';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { getFullImageUrl } from '../../utils/formatStatus';

export const AdminProfile = () => {
  const { user, refreshUser } = useAuth();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }

    setPwdLoading(true);
    try {
      await userService.changePassword({ currentPassword, newPassword, confirmPassword });
      setPwdSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.friendlyMessage || 'Failed to update administrative password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administrator Profile & Security</h2>
        <p className="text-xs text-slate-500">
          Manage your credentials, platform authorization level, and account security.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden ring-4 ring-white">
              {user.profileImage ? (
                <img
                  src={getFullImageUrl(user.profileImage)}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user.firstName?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Administrator
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>

        {/* Profile Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-slate-800 font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Contact Phone</p>
              <p className="text-slate-800 font-semibold">{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Operational Base</p>
              <p className="text-slate-800 font-semibold">
                {user.city ? `${user.city}, ${user.state || ''} ${user.pincode || ''}` : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Admin Since</p>
              <p className="text-slate-800 font-semibold">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-xl">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Change Admin Password</h3>
            <p className="text-xs text-slate-500">Ensure a strong passkey of 8+ characters.</p>
          </div>
        </div>

        <ErrorMessage message={pwdError} />

        {pwdSuccess && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Administrator password updated successfully!</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pwdLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Admin Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
