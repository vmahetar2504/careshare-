import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Clock,
  Layers,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import * as adminService from '../../services/admin.service';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/formatDate';
import { getBorrowBadge } from '../../utils/formatStatus';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboardStats();
      if (res?.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load administrative statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading fullScreen text="Loading operational metrics..." />;

  return (
    <div className="space-y-8">
      {/* Overview Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Operations Dashboard</h1>
        <p className="text-xs text-slate-500">
          Monitor community equipment flow, safety inspections, sanitization pipelines, and system capacity.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchStats} />

      {stats && (
        <>
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-card transition"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.users?.total || 0}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  {stats.users?.active || 0} active {stats.users?.inactive ? `(${stats.users.inactive} inactive)` : ''}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </Link>

            <Link
              to="/admin/pending-equipment"
              className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between hover:shadow-card transition"
            >
              <div>
                <p className="text-xs font-semibold text-amber-600">Pending Verification</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {stats.equipment?.pendingVerification || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  Action required <ArrowRight className="w-3 h-3" />
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </Link>

            <Link
              to="/admin/equipment"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-card transition"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400">Available Equipment</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {stats.equipment?.available || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Out of {stats.equipment?.total || 0} total items
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </Link>

            <Link
              to="/admin/borrow-requests"
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-card transition"
            >
              <div>
                <p className="text-xs font-semibold text-slate-400">Active Borrowings</p>
                <p className="text-2xl font-bold text-brand-600 mt-1">
                  {stats.borrowRequests?.active || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {stats.borrowRequests?.pending || 0} pending requests
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            </Link>
          </div>

          {/* Operational Pipeline Queues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/returns"
              className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-card transition flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Pending Returns</h3>
                <p className="text-2xl font-extrabold text-blue-700 mt-0.5">
                  {stats.operations?.pendingReturns || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Awaiting borrower drop-off or receipt</p>
              </div>
            </Link>

            <Link
              to="/admin/inspections"
              className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-card transition flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Inspection Queue</h3>
                <p className="text-2xl font-extrabold text-purple-700 mt-0.5">
                  {stats.operations?.pendingInspections || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Returned items awaiting safety check</p>
              </div>
            </Link>

            <Link
              to="/admin/sanitization"
              className="bg-white p-5 rounded-2xl border border-cyan-200/80 shadow-xs hover:shadow-card transition flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">Sanitization Queue</h3>
                <p className="text-2xl font-extrabold text-cyan-700 mt-0.5">
                  {stats.operations?.pendingSanitizations || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Waiting for disinfection</p>
              </div>
            </Link>

            <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">In Maintenance</h3>
                <p className="text-2xl font-extrabold text-rose-700 mt-0.5">
                  {stats.equipment?.inMaintenance || 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stats.operations?.damageCases || 0} damage reported cases
                </p>
              </div>
            </div>
          </div>

          {/* Equipment Status Inventory Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Equipment Inventory Lifecycle Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-lg font-bold text-emerald-700">{stats.equipment?.available || 0}</p>
                <p className="text-[11px] font-medium text-emerald-800">Available</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <p className="text-lg font-bold text-amber-700">{stats.equipment?.reserved || 0}</p>
                <p className="text-[11px] font-medium text-amber-800">Reserved</p>
              </div>
              <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100">
                <p className="text-lg font-bold text-brand-700">{stats.equipment?.borrowed || 0}</p>
                <p className="text-[11px] font-medium text-brand-800">Borrowed</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-100">
                <p className="text-lg font-bold text-cyan-700">{stats.equipment?.inSanitization || 0}</p>
                <p className="text-[11px] font-medium text-cyan-800">Sanitization</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <p className="text-lg font-bold text-rose-700">{stats.equipment?.inMaintenance || 0}</p>
                <p className="text-[11px] font-medium text-rose-800">Maintenance</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <p className="text-lg font-bold text-slate-700">{stats.equipment?.rejected || 0}</p>
                <p className="text-[11px] font-medium text-slate-800">Rejected</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Recent Borrow Activity</h3>
              <Link
                to="/admin/borrow-requests"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View All Activity →
              </Link>
            </div>

            {stats.recentActivity?.recentRequests?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-5 py-3">Equipment</th>
                      <th className="px-5 py-3">Borrower</th>
                      <th className="px-5 py-3">Owner</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentActivity.recentRequests.map((req) => {
                      const badge = getBorrowBadge(req.status);
                      return (
                        <tr key={req._id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3.5 font-bold text-slate-800">
                            {req.equipment?.name || 'N/A'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {req.borrower?.firstName} {req.borrower?.lastName}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {req.owner?.firstName} {req.owner?.lastName}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {formatDate(req.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No recent activity.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
