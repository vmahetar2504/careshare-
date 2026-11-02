import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  CheckCircle,
  Clock,
  ClipboardList,
  Sparkles,
  Package,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';
import * as returnService from '../services/return.service';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { getReturnBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate } from '../utils/formatDate';

export const MyReturns = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Receive return modal
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receivedCondition, setReceivedCondition] = useState('GOOD');
  const [receivedNotes, setReceivedNotes] = useState('');
  const [receiveLoading, setReceiveLoading] = useState(false);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await returnService.getAllReturns({ page, limit: 6 });
      if (res?.data) {
        setReturns(res.data.returns || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load return records.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    if (!receiveTarget) return;
    setReceiveLoading(true);
    try {
      await returnService.receiveReturn(receiveTarget._id, {
        returnCondition: receivedCondition,
        notes: receivedNotes.trim() || undefined,
      });
      setReceiveTarget(null);
      fetchReturns();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to confirm receipt of return.');
    } finally {
      setReceiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Equipment Returns & Handover</h2>
        <p className="text-xs text-slate-500">
          Track returning equipment through quality inspection and hospital sanitization.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchReturns} />

      {loading ? (
        <Loading text="Loading returns..." />
      ) : returns.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {returns.map((item) => {
              const statusBadge = getReturnBadge(item.status);
              const isOwner = user?._id === item.owner?._id;
              const canConfirmReceipt = isOwner && item.status === 'REQUESTED';

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-card transition"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.equipment?.images?.[0]
                            ? getFullImageUrl(item.equipment.images[0])
                            : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={item.equipment?.name}
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
                          Initiated {formatDate(item.requestedAt)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 truncate">
                        {item.equipment?.name}
                      </h3>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-4">
                        <span>
                          <strong>Reported Condition:</strong> {item.returnCondition || 'Good'}
                        </span>
                        {item.returnedAt && (
                          <span>
                            <strong>Received On:</strong> {formatDate(item.returnedAt)}
                          </span>
                        )}
                        <span>
                          <strong>Borrower:</strong> {item.borrower?.firstName} {item.borrower?.lastName}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Owner Action */}
                  {canConfirmReceipt && (
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setReceiveTarget(item);
                          setReceivedCondition(item.returnCondition || 'GOOD');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirm Return Received
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={RotateCcw}
          title="No Return Records"
          description="You do not have any active or past equipment return operations."
        />
      )}

      {/* Confirm Return Receipt Modal */}
      <Modal
        isOpen={Boolean(receiveTarget)}
        onClose={() => setReceiveTarget(null)}
        title="Confirm Equipment Return Handover"
      >
        <form onSubmit={handleReceiveSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please confirm you have received{' '}
            <strong className="text-slate-900">{receiveTarget?.equipment?.name}</strong> back in
            person. Once confirmed, this item will be scheduled for medical quality inspection.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition Upon Handover
            </label>
            <select
              value={receivedCondition}
              onChange={(e) => setReceivedCondition(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="EXCELLENT">Excellent (Flawless)</option>
              <option value="GOOD">Good (Normal wear)</option>
              <option value="FAIR">Fair (Visible signs of use)</option>
              <option value="DAMAGED">Damaged (Needs repair)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Remarks
            </label>
            <textarea
              rows={2}
              value={receivedNotes}
              onChange={(e) => setReceivedNotes(e.target.value)}
              placeholder="e.g. Received all accessories, battery charger included..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReceiveTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={receiveLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {receiveLoading ? 'Saving...' : 'Confirm Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyReturns;
