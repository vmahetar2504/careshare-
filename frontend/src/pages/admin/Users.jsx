import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserCheck, UserX, Shield, Loader2, Package, Layers } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import useAuth from '../../hooks/useAuth';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/formatDate';

export const ManageUsers = () => {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle user state modal
  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 10 };
      if (search.trim()) query.search = search.trim();
      if (roleFilter) query.role = roleFilter;
      if (statusFilter) query.status = statusFilter;

      const res = await adminService.getAllUsers(query);
      if (res?.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleConfirm = async () => {
    if (!toggleTarget) return;
    setToggleLoading(true);
    try {
      await adminService.toggleUserStatus(toggleTarget._id);
      setToggleTarget(null);
      fetchUsers();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to update user account status.');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Directory</h2>
          <p className="text-xs text-slate-500">
            View registered donors and borrowers, equipment activity, account status, and moderate access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-w-lg w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, city..."
            className="flex-1 min-w-[160px] px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchUsers} />

      {loading ? (
        <Loading text="Loading user directory..." />
      ) : users.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Email & Phone</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Activity</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isActive = u.isActive !== false;
                    const isSelf = currentAuthUser?._id === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          <div>
                            <p>{u.firstName} {u.lastName}</p>
                            {isSelf && (
                              <span className="text-[10px] text-purple-600 font-semibold">(Current You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p>{u.email}</p>
                          <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {u.city ? `${u.city}${u.state ? `, ${u.state}` : ''}` : 'Not set'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                              <Package className="w-3 h-3 text-brand-600" />
                              {u.equipmentCount ?? 0} listed
                            </span>
                            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                              <Layers className="w-3 h-3 text-indigo-600" />
                              {u.borrowCount ?? 0} requests
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            disabled={isSelf && isActive}
                            onClick={() => setToggleTarget(u)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${
                              isActive
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                            title={isSelf && isActive ? 'Cannot deactivate your own logged-in admin account' : ''}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description="No users matched your query."
        />
      )}

      {/* Toggle Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleConfirm}
        title={toggleTarget?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${
          toggleTarget?.isActive ? 'deactivate' : 'activate'
        } ${toggleTarget?.firstName} ${toggleTarget?.lastName}'s account?`}
        confirmText={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        isDanger={toggleTarget?.isActive}
        loading={toggleLoading}
      />
    </div>
  );
};

export default ManageUsers;
