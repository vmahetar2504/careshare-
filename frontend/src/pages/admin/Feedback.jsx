import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquareText, Search, CheckCheck, Clock3, ShieldCheck, Filter } from 'lucide-react';
import * as feedbackService from '../../services/feedback.service';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import { formatDateTime } from '../../utils/formatDate';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const ManageFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = { page, limit: 10 };
      if (search.trim()) query.search = search.trim();
      if (statusFilter) query.status = statusFilter;

      const res = await feedbackService.getAdminFeedback(query);
      if (res?.data) {
        setFeedbackList(res.data.feedback || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load feedback entries.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (feedbackId, status) => {
    setUpdatingId(feedbackId);
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status);
      await fetchFeedback();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to update feedback status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Feedback Management</h2>
          <p className="text-xs text-slate-500">
            Review community feedback, monitor user sentiment, and track support status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-w-xl w-full">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search feedback..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchFeedback} />

      {loading ? (
        <Loading text="Loading community feedback..." />
      ) : feedbackList.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Message</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackList.map((item) => (
                  <tr key={item._id} className="align-top hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown User'}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.user?.email || 'No email'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 font-bold">
                        {item.rating} ★
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{item.category}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-md">{item.message}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(item.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyles[item.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {item.status}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['pending', 'reviewed', 'resolved'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={updatingId === item._id}
                              onClick={() => handleStatusChange(item._id, status)}
                              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                                status === item.status
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-500">
              <MessageSquareText className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No feedback yet</h3>
          <p className="text-sm text-slate-500 mt-2">
            Community feedback will appear here once users submit reviews or suggestions.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageFeedback;
