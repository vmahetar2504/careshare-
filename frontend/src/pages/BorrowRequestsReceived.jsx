import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  CheckCircle,
  XCircle,
  PackageCheck,
  Calendar,
  User,
  MapPin,
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import * as borrowService from '../services/borrow.service';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { getBorrowBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate } from '../utils/formatDate';

export const BorrowRequestsReceived = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReceivedRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowService.getReceivedBorrowRequests({ page, limit: 6 });
      if (res?.data) {
        setRequests(res.data.requests || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load incoming borrow requests.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await borrowService.approveBorrowRequest(id);
      fetchReceivedRequests();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to approve borrow request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await borrowService.rejectBorrowRequest(rejectTarget._id, rejectReason.trim());
      setRejectTarget(null);
      setRejectReason('');
      fetchReceivedRequests();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to reject borrow request.');
    } finally {
      setRejectLoading(false);
    }
  };

  const handlePickup = async (id) => {
    setActionLoadingId(id);
    try {
      await borrowService.pickupBorrowRequest(id);
      fetchReceivedRequests();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to confirm pickup.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Incoming Borrow Requests</h2>
        <p className="text-xs text-slate-500">
          Review community requests to borrow your medical equipment.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchReceivedRequests} />

      {loading ? (
        <Loading text="Loading incoming requests..." />
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const statusBadge = getBorrowBadge(req.status);
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isProcessing = actionLoadingId === req._id;

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-card transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          req.equipment?.images?.[0]
                            ? getFullImageUrl(req.equipment.images[0])
                            : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={req.equipment?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          Received on {formatDate(req.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 truncate">
                        {req.equipment?.name || 'Equipment'}
                      </h3>

                      {/* Borrower Info & Dates */}
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          Borrower: {req.borrower?.firstName} {req.borrower?.lastName} •{' '}
                          <span className="text-slate-500 font-normal">
                            {req.borrower?.phone || req.borrower?.email}
                          </span>
                        </p>
                        <p className="text-slate-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          Requested Period: {formatDate(req.requestedFrom)} to{' '}
                          {formatDate(req.requestedUntil)}
                        </p>
                        <p className="text-slate-700 italic pt-1">
                          "{req.reason}"
                          {req.message ? ` — Note: ${req.message}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link
                      to={`/borrow-requests/${req._id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center"
                    >
                      View Details
                    </Link>

                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectTarget(req)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req._id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
                        >
                          {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Approve
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => handlePickup(req._id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs disabled:opacity-50"
                      >
                        {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <PackageCheck className="w-3.5 h-3.5" />
                        Confirm Pickup
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={HeartHandshake}
          title="No Incoming Requests"
          description="You haven't received any borrow requests for your equipment yet."
        />
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Decline Borrow Request"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please share a courteous reason for declining the request for{' '}
            <strong className="text-slate-900">{rejectTarget?.equipment?.name}</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Declining <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Currently in personal use, or maintenance needed..."
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejectLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowRequestsReceived;
