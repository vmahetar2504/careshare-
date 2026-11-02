import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Calendar, User, Eye, Search, Filter } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import { getBorrowBadge } from '../../utils/formatStatus';
import { formatDate } from '../../utils/formatDate';

export const ManageBorrowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 10 };
      if (statusFilter) query.status = statusFilter;
      if (search.trim()) query.search = search.trim();
      
      const res = await adminService.getAllBorrowRequests(query);
      if (res?.data) {
        setRequests(res.data.requests || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load borrow requests.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Borrow Requests</h2>
          <p className="text-xs text-slate-500">
            System-wide oversight of equipment reservations, active handovers, and full lending history.
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by equipment, borrower, or owner..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden whitespace-nowrap"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="RETURN_REQUESTED">Return Requested</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchRequests} />

      {loading ? (
        <Loading text="Loading borrow requests..." />
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Borrower</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => {
                    const badge = getBorrowBadge(req.status);
                    return (
                      <tr key={req._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          <div>
                            <p className="truncate max-w-[200px]">{req.equipment?.name || 'N/A'}</p>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ID: {req._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {req.borrower?.firstName} {req.borrower?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{req.borrower?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {req.owner?.firstName} {req.owner?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{req.owner?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p>{formatDate(req.requestedFrom)} – {formatDate(req.requestedUntil)}</p>
                          {req.pickedUpAt && (
                            <p className="text-[10px] text-emerald-600">Picked: {formatDate(req.pickedUpAt)}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/borrow-requests/${req._id}`}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>
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
          icon={Layers}
          title="No Borrow Requests Found"
          description="There are currently no borrow requests under this filter."
        />
      )}
    </div>
  );
};

export default ManageBorrowRequests;
