import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  ShieldAlert,
  Loader2,
  Calendar,
} from 'lucide-react';
import * as inspectionService from '../../services/inspection.service';
import * as returnService from '../../services/return.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/formatDate';

export const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Inspection Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [conditionAfter, setConditionAfter] = useState('GOOD');
  const [damageFound, setDamageFound] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [estimatedRepairRequired, setEstimatedRepairRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInspectionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inspRes, retRes] = await Promise.all([
        inspectionService.getAllInspections({ page, limit: 6 }),
        returnService.getAllReturns({ status: 'INSPECTION_PENDING', limit: 20 }),
      ]);

      if (inspRes?.data) {
        setInspections(inspRes.data.inspections || []);
        setPagination(inspRes.data.pagination || null);
      }
      if (retRes?.data) {
        setPendingReturns(retRes.data.returns || []);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load inspections.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchInspectionData();
  }, [fetchInspectionData]);

  const handleOpenInspect = (retItem) => {
    setSelectedReturn(retItem);
    setConditionAfter(retItem.returnCondition || 'GOOD');
    setDamageFound(retItem.returnCondition === 'DAMAGED');
    setDamageDescription('');
    setEstimatedRepairRequired(false);
    setNotes('');
    setInspectModalOpen(true);
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setError(null);

    if (damageFound && !damageDescription.trim()) {
      setError('Please provide a damage description when damage is reported.');
      return;
    }

    setSubmitting(true);
    try {
      await inspectionService.createInspection({
        returnId: selectedReturn._id,
        conditionBefore: selectedReturn.returnCondition || 'GOOD',
        conditionAfter,
        damageFound,
        damageDescription: damageFound ? damageDescription.trim() : undefined,
        estimatedRepairRequired,
        notes: notes.trim() || undefined,
      });

      setInspectModalOpen(false);
      fetchInspectionData();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to record inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-purple-600" />
          Equipment Damage & Quality Inspection
        </h2>
        <p className="text-xs text-slate-500">
          Verify physical condition of returned medical equipment before moving to Sanitization or Maintenance.
        </p>
      </div>

      <ErrorMessage message={error} onRetry={fetchInspectionData} />

      {/* Pending Inspection Queue Section */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Awaiting Safety Inspection ({pendingReturns.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Returned by community borrowers</span>
        </div>

        {pendingReturns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReturns.map((ret) => (
              <div
                key={ret._id}
                className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{ret.equipment?.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Borrower: {ret.borrower?.firstName} {ret.borrower?.lastName} • Reported Condition:{' '}
                    <span className="font-semibold">{ret.returnCondition || 'Good'}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenInspect(ret)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs flex-shrink-0"
                >
                  Perform Inspection
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">
            No equipment currently waiting in the inspection queue.
          </p>
        )}
      </div>

      {/* Past Inspections Log */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs">
          Inspection History & Logs
        </h3>

        {loading ? (
          <Loading text="Loading inspection logs..." />
        ) : inspections.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {inspections.map((insp) => {
                const isDamage = insp.status === 'DAMAGE_FOUND';
                return (
                  <div
                    key={insp._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isDamage
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isDamage ? 'DAMAGE FOUND' : 'PASSED INSPECTION'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(insp.inspectedAt)}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800">
                        {insp.equipment?.name || 'Equipment'}
                      </h4>

                      <p className="text-xs text-slate-500">
                        Inspected by: {insp.inspectedBy?.firstName} {insp.inspectedBy?.lastName} • Condition: {insp.conditionAfter}
                      </p>

                      {insp.damageDescription && (
                        <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg mt-1 font-medium">
                          Damage: {insp.damageDescription} (Routed to Maintenance)
                        </p>
                      )}

                      {insp.notes && (
                        <p className="text-xs text-slate-500 italic">Notes: {insp.notes}</p>
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
            icon={ClipboardList}
            title="No Inspections Logged"
            description="No medical inspections have been recorded yet."
          />
        )}
      </div>

      {/* Perform Inspection Modal */}
      <Modal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        title="Record Equipment Safety Inspection"
      >
        <form onSubmit={handleInspectionSubmit} className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 border border-purple-200">
            Evaluating: <strong className="text-slate-900">{selectedReturn?.equipment?.name}</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition After Physical Inspection <span className="text-rose-500">*</span>
            </label>
            <select
              value={conditionAfter}
              onChange={(e) => {
                setConditionAfter(e.target.value);
                if (e.target.value === 'DAMAGED') setDamageFound(true);
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              <option value="NEW">New / Pristine</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair (Safe, minor wear)</option>
              <option value="DAMAGED">Damaged / Broken Parts</option>
            </select>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={damageFound}
                onChange={(e) => setDamageFound(e.target.checked)}
                className="rounded-sm text-purple-600 focus:ring-purple-500"
              />
              Damage Found on Equipment
            </label>

            {damageFound && (
              <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                <textarea
                  rows={2}
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Describe damage found (e.g. cracked footplate, loose armrest bolt)..."
                  required={damageFound}
                  className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
                <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-700 font-medium">
                  <input
                    type="checkbox"
                    checked={estimatedRepairRequired}
                    onChange={(e) => setEstimatedRepairRequired(e.target.checked)}
                    className="rounded-sm text-rose-600 focus:ring-rose-500"
                  />
                  Professional Repair / Maintenance Required
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Remarks & Swab Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mechanical components intact, wheels spin freely..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInspectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl transition shadow-xs disabled:opacity-50 ${
                damageFound
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {damageFound ? 'Route to Maintenance' : 'Pass & Move to Sanitization'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inspections;
