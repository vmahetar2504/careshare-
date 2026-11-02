import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Calendar, User, Eye, Search, Filter, ClipboardList, CheckCircle } from 'lucide-react';
import * as adminService from '../../services/admin.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import { getReturnBadge } from '../../utils/formatStatus';
import { formatDate } from '../../utils/formatDate';

export const ManageReturns = () => {
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 10 };
      if (statusFilter) query.status = statusFilter;
      if (search.trim()) query.search = search.trim();

      const res = await adminService.getAllReturns(query);
      if (res?.data) {
        setReturns(res.data.returns || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load return records.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Equipment Return Management</h2>
          <p className="text-xs text-slate-500">
            Monitor return requests, owner receipts, and handovers to inspection and sanitization pipelines.
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
            <option value="REQUESTED">Requested</option>
            <option value="ITEM_RETURNED">Item Returned</option>
            <option value="INSPECTION_PENDING">Inspection Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchReturns} />

      {loading ? (
        <Loading text="Loading equipment returns..." />
      ) : returns.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Borrower</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Dates</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returns.map((ret) => {
                    const badge = getReturnBadge(ret.status);
                    return (
                      <tr key={ret._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          <div>
                            <p className="truncate max-w-[200px]">{ret.equipment?.name || 'N/A'}</p>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Return ID: {ret._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {ret.borrower?.firstName} {ret.borrower?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{ret.borrower?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">
                            {ret.owner?.firstName} {ret.owner?.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400">{ret.owner?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <p>Req: {formatDate(ret.returnDate || ret.createdAt)}</p>
                          {ret.receivedDate && (
                            <p className="text-[10px] text-emerald-600">
                              Received: {formatDate(ret.receivedDate)}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          {ret.borrowRequest && (
                            <Link
                              to={`/borrow-requests/${ret.borrowRequest?._id || ret.borrowRequest}`}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                              title="Borrow Request Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Borrow Details
                            </Link>
                          )}
                          {(ret.status === 'INSPECTION_PENDING' || ret.status === 'ITEM_RETURNED') && (
                            <Link
                              to="/admin/inspections"
                              className="text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                              title="Go to Inspections"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              Inspect
                            </Link>
                          )}
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
          icon={RotateCcw}
          title="No Return Records Found"
          description="There are currently no returns matching your search criteria."
        />
      )}
    </div>
  );
};

export default ManageReturns;
