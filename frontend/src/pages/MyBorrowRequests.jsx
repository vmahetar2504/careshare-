import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Calendar,
  MapPin,
  Clock,
  RotateCcw,
  XCircle,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import * as borrowService from '../services/borrow.service';
import * as returnService from '../services/return.service';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { getBorrowBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate } from '../utils/formatDate';

export const MyBorrowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Return modal state
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 6 };
      if (statusFilter !== 'ALL') {
        query.status = statusFilter;
      }
      const res = await borrowService.getMyBorrowRequests(query);
      if (res?.data) {
        setRequests(res.data.requests || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load borrow requests.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await borrowService.cancelBorrowRequest(cancelTarget._id);
      setCancelTarget(null);
      fetchMyRequests();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to cancel borrow request.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnTarget) return;
    setReturnLoading(true);
    try {
      await returnService.createReturnRequest({
        borrowRequestId: returnTarget._id,
        returnCondition,
        notes: returnNotes.trim() || undefined,
      });
      setReturnTarget(null);
      setReturnNotes('');
      fetchMyRequests();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to initiate return.');
    } finally {
      setReturnLoading(false);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Requests' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'ACTIVE', label: 'Active Borrowing' },
    { id: 'RETURN_REQUESTED', label: 'Return Initiated' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'REJECTED', label: 'Declined' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Borrow Requests</h2>
          <p className="text-xs text-slate-500">
            Track equipment you requested from community donors.
          </p>
        </div>
        <Link
          to="/equipment"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition shadow-xs"
        >
          Find More Equipment
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setStatusFilter(tab.id);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
              statusFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} onRetry={fetchMyRequests} />

      {loading ? (
        <Loading text="Loading your requests..." />
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => {
              const statusBadge = getBorrowBadge(req.status);
              const canCancel = ['PENDING', 'APPROVED'].includes(req.status);
              const canReturn = req.status === 'ACTIVE';

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

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          Requested on {formatDate(req.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 truncate">
                        {req.equipment?.name || 'Equipment'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {formatDate(req.requestedFrom)} – {formatDate(req.requestedUntil)}
                        </span>
                        <span>
                          Owner: {req.owner?.firstName} {req.owner?.lastName} ({req.owner?.city || 'Local'})
                        </span>
                      </div>

                      {req.rejectionReason && (
                        <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg mt-2">
                          <strong>Declined Reason:</strong> {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
                    <Link
                      to={`/borrow-requests/${req._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      Details
                    </Link>

                    {canReturn && (
                      <button
                        type="button"
                        onClick={() => setReturnTarget(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Request Return
                      </button>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
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
          icon={Layers}
          title="No Borrow Requests"
          description="You don't have any borrow requests under this status tab."
          actionLabel="Browse Available Equipment"
          actionLink="/equipment"
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Borrow Request"
        message={`Are you sure you want to cancel your request for "${cancelTarget?.equipment?.name}"?`}
        confirmText="Yes, Cancel Request"
        isDanger={true}
        loading={cancelLoading}
      />

      {/* Return Request Modal */}
      <Modal
        isOpen={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        title="Initiate Equipment Return"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Ready to hand back{' '}
            <strong className="text-slate-900">{returnTarget?.equipment?.name}</strong>? Please let
            the owner know its condition.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Condition
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="EXCELLENT">Excellent (Like New)</option>
              <option value="GOOD">Good (Clean & Fully Functional)</option>
              <option value="FAIR">Fair (Minor Wear)</option>
              <option value="DAMAGED">Damaged / Requires Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Return Notes / Handover Preference
            </label>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Cleaned and ready for pickup tomorrow evening..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={returnLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              Confirm Return Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBorrowRequests;
