import React, { useState } from 'react';
import Modal from '../Modal';
import ErrorMessage from '../ErrorMessage';
import { Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as borrowService from '../../services/borrow.service';

export const BorrowRequestModal = ({ isOpen, onClose, equipment, onSuccess }) => {
  const [requestedFrom, setRequestedFrom] = useState('');
  const [requestedUntil, setRequestedUntil] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Set default min date to today
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!requestedFrom || !requestedUntil) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(requestedFrom) >= new Date(requestedUntil)) {
      setError('End date must be strictly after the start date.');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      setError('Please describe your medical recovery reason (at least 5 characters).');
      return;
    }

    setLoading(true);
    try {
      await borrowService.createBorrowRequest({
        equipmentId: equipment._id,
        requestedFrom,
        requestedUntil,
        reason: reason.trim(),
        message: message.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1800);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to submit borrow request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request to Borrow Equipment" maxWidth="max-w-lg">
      {success ? (
        <div className="text-center py-8 space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Borrow Request Submitted!</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            The owner has been notified. You can track this request under{' '}
            <span className="font-semibold text-brand-600">My Borrow Requests</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Equipment Preview Banner */}
          {equipment && (
            <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-brand-200 overflow-hidden flex-shrink-0">
                <img
                  src={
                    equipment.images?.[0]
                      ? `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${
                          equipment.images[0]
                        }`
                      : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={equipment.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">{equipment.name}</h4>
                <p className="text-xs text-brand-700">
                  {equipment.category} • Condition: {equipment.condition}
                </p>
              </div>
            </div>
          )}

          <ErrorMessage message={error} />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date (Pickup) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={today}
                  value={requestedFrom}
                  onChange={(e) => setRequestedFrom(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated End Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={requestedFrom || today}
                  value={requestedUntil}
                  onChange={(e) => setRequestedUntil(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medical Need / Recovery Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Post-orthopedic surgery mobility support for 3 weeks..."
              required
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Optional Note to Equipment Owner
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I have transport arranged and can collect Saturday morning."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <span>
              CareShare is 100% free community sharing. Please treat all borrowed equipment with care and return promptly after recovery.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default BorrowRequestModal;
