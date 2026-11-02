import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Tag,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import * as adminService from '../../services/admin.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { getFullImageUrl } from '../../utils/formatStatus';
import { formatDate } from '../../utils/formatDate';

export const PendingEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPendingEquipment({ page, limit: 6 });
      if (res?.data) {
        setEquipmentList(res.data.equipment || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load pending equipment.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    try {
      await adminService.approveEquipment(id);
      fetchPending();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to approve equipment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget || !rejectionReason.trim()) return;
    setRejectLoading(true);
    try {
      await adminService.rejectEquipment(rejectTarget._id, rejectionReason.trim());
      setRejectTarget(null);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to reject equipment.');
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-500" />
          Pending Equipment Verification
        </h2>
        <p className="text-xs text-slate-500">
          Review community submissions. Approving sets status to APPROVED and AVAILABLE in the catalog.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchPending} />

      {loading ? (
        <Loading text="Loading pending submissions..." />
      ) : equipmentList.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {equipmentList.map((item) => {
              const isProcessing = actionLoadingId === item._id;
              const primaryImage =
                item.images && item.images.length > 0
                  ? getFullImageUrl(item.images[0])
                  : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=200&q=80';

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-card transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img src={primaryImage} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          PENDING VERIFICATION
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 truncate">{item.name}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          <strong>Category:</strong> {item.category}
                        </span>
                        <span>
                          <strong>Condition:</strong> {item.condition}
                        </span>
                        <span>
                          <strong>Donor:</strong> {item.owner?.firstName} {item.owner?.lastName} (
                          {item.owner?.city || 'Local'})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 pt-1">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link
                      to={`/equipment/${item._id}`}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      <Eye className="w-3.5 h-3.5 inline mr-1" />
                      Inspect
                    </Link>

                    <button
                      type="button"
                      onClick={() => setRejectTarget(item)}
                      disabled={isProcessing}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5 inline mr-1" />
                      Decline
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(item._id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Approve & Publish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle}
          title="All Caught Up!"
          description="There are currently no equipment listings awaiting verification."
        />
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Decline Equipment Verification"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Specify the safety, description, or policy reason for rejecting{' '}
            <strong className="text-slate-900">{rejectTarget?.name}</strong>. The owner will receive
            a notification with this reason.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Unclear photos, excessive wear, or requires medical prescription..."
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

export default PendingEquipment;
