import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Loader2, Calendar } from 'lucide-react';
import * as sanitizationService from '../../services/sanitization.service';
import * as inspectionService from '../../services/inspection.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/formatDate';

export const Sanitization = () => {
  const [sanitizations, setSanitizations] = useState([]);
  const [passedInspections, setPassedInspections] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Sanitization modal
  const [sanitizeModalOpen, setSanitizeModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [method, setMethod] = useState(
    'Hospital-grade quaternary ammonium wipe down and UV-C sterilization'
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Complete action loading
  const [completeLoadingId, setCompleteLoadingId] = useState(null);

  const fetchSanitizationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sanRes, inspRes] = await Promise.all([
        sanitizationService.getAllSanitizations({ page, limit: 6 }),
        inspectionService.getAllInspections({ status: 'PASSED', limit: 20 }),
      ]);

      if (sanRes?.data) {
        setSanitizations(sanRes.data.sanitizations || []);
        setPagination(sanRes.data.pagination || null);
      }
      if (inspRes?.data) {
        setPassedInspections(inspRes.data.inspections || []);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load sanitization logs.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSanitizationData();
  }, [fetchSanitizationData]);

  const handleStartSanitization = (inspItem) => {
    setSelectedInspection(inspItem);
    setMethod('Hospital-grade quaternary ammonium wipe down and UV-C sterilization');
    setNotes('');
    setSanitizeModalOpen(true);
  };

  const handleSanitizationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInspection || !method.trim()) return;
    setSubmitting(true);
    try {
      // 1. Create sanitization log
      const res = await sanitizationService.createSanitization({
        inspectionId: selectedInspection._id,
        method: method.trim(),
        notes: notes.trim() || undefined,
      });

      // 2. Immediately complete and restore to AVAILABLE
      if (res?.data?.sanitization?._id) {
        await sanitizationService.completeSanitization(res.data.sanitization._id, {
          notes: 'Standard hospital protocol completed. Clear for community use.',
        });
      }

      setSanitizeModalOpen(false);
      fetchSanitizationData();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to record sanitization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteExisting = async (sanId) => {
    setCompleteLoadingId(sanId);
    try {
      await sanitizationService.completeSanitization(sanId);
      fetchSanitizationData();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to complete sanitization.');
    } finally {
      setCompleteLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-600" />
          Equipment Hospital Sanitization
        </h2>
        <p className="text-xs text-slate-500">
          Decontaminate returned items using clinical antimicrobial standards. Completing sanitization restores equipment to AVAILABLE in the community bank.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchSanitizationData} />

      {/* Awaiting Sanitization Queue */}
      <div className="bg-white rounded-3xl p-6 border border-cyan-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Passed Inspection, Ready for Sanitization ({passedInspections.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Clinical cleanliness check</span>
        </div>

        {passedInspections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passedInspections.map((insp) => (
              <div
                key={insp._id}
                className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{insp.equipment?.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category: {insp.equipment?.category} • Passed on {formatDate(insp.inspectedAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartSanitization(insp)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition shadow-xs flex-shrink-0"
                >
                  Sanitize & Restore
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">
            No equipment currently awaiting sanitization.
          </p>
        )}
      </div>

      {/* Completed Sanitization History */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs">
          Sanitization Audit Logs
        </h3>

        {loading ? (
          <Loading text="Loading sanitization logs..." />
        ) : sanitizations.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {sanitizations.map((san) => {
                const isCompleted = san.status === 'COMPLETED';
                return (
                  <div
                    key={san._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {san.status}
                        </span>
                        {san.sanitizedAt && (
                          <span className="text-xs text-slate-400">
                            Completed {formatDate(san.sanitizedAt)}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-800">
                        {san.equipment?.name || 'Equipment'}
                      </h4>

                      <p className="text-xs text-slate-600">
                        <strong>Protocol / Method:</strong> {san.method}
                      </p>

                      <p className="text-xs text-slate-400">
                        Performed by: {san.performedBy?.firstName} {san.performedBy?.lastName}
                      </p>
                    </div>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCompleteExisting(san._id)}
                        disabled={completeLoadingId === san._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50 flex-shrink-0"
                      >
                        {completeLoadingId === san._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Complete Sanitization
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No Sanitization Logs"
            description="No sanitization logs recorded in this period."
          />
        )}
      </div>

      {/* Sanitize Modal */}
      <Modal
        isOpen={sanitizeModalOpen}
        onClose={() => setSanitizeModalOpen(false)}
        title="Execute & Complete Hospital Sanitization"
      >
        <form onSubmit={handleSanitizationSubmit} className="space-y-4">
          <div className="p-3 bg-cyan-50 rounded-xl text-xs text-cyan-900 border border-cyan-200">
            Sanitizing:{' '}
            <strong className="text-slate-900">{selectedInspection?.equipment?.name}</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sanitization Method & Disinfectant Product <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sterilization Remarks / Quality Check
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. High-touch areas wiped, contact time 15 min, swab test negative..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Submitting will automatically mark this equipment as <strong>AVAILABLE</strong> in the
              public catalog.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSanitizeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Complete & Restore Available
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sanitization;
