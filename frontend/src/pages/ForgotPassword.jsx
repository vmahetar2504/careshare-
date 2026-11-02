import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import * as authService from '../services/auth.service';
import ErrorMessage from '../components/ErrorMessage';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessInfo(res?.data || { message: 'Reset token generated if the email exists.' });
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-health-500 flex items-center justify-center text-white shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Care<span className="text-brand-600">Share</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-xs text-slate-500">
            Enter your registered email and we will generate a password recovery link.
          </p>
        </div>

        <ErrorMessage message={error} />

        {successInfo ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Password Reset Requested</p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                {successInfo.message || 'Check your inbox for password reset instructions.'}
              </p>
            </div>

            {/* Development helper shortcut */}
            {successInfo.devResetToken && (
              <div className="p-3 bg-white border border-emerald-300 rounded-xl text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Development Mode Helper
                </span>
                <p className="text-xs text-slate-600 font-mono break-all">
                  Token: {successInfo.devResetToken}
                </p>
                <Link
                  to={`/reset-password/${successInfo.devResetToken}`}
                  className="block text-center py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  Proceed to Reset Password Page →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-emerald-800 hover:underline pt-2"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
