import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Lock, CheckCircle, Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import * as userService from '../services/user.service';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatDate';
import { getFullImageUrl } from '../utils/formatStatus';

export const Profile = () => {
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
      setPwdError(err.friendlyMessage || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-health-500 text-white font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden ring-4 ring-white">
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
              <h2 className="text-2xl font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {user.role} Account
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>

        {/* Profile Info Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone</p>
              <p className="text-slate-800 font-semibold">{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-slate-800 font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Address</p>
              <p className="text-slate-800 font-semibold">
                {user.address ? `${user.address}, ` : ''}
                {user.city || 'No city set'}
                {user.pincode ? ` - ${user.pincode}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Member Since</p>
              <p className="text-slate-800 font-semibold">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            Security & Password
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Update your account password to keep your CareShare account secure.
          </p>
        </div>

        <ErrorMessage message={pwdError} />

        {pwdSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            Password successfully updated!
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {pwdLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
