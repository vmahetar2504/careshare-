import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import * as borrowService from '../services/borrow.service';
import useAuth from '../hooks/useAuth';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getBorrowBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate, formatDateTime } from '../utils/formatDate';

export const BorrowRequestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await borrowService.getBorrowRequestById(id);
        if (res?.data?.borrowRequest) {
          setRequest(res.data.borrowRequest);
        }
      } catch (err) {
        setError(err.friendlyMessage || 'Failed to load borrow request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <Loading fullScreen text="Loading request details..." />;
  if (error || !request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <ErrorMessage message={error || 'Borrow request not found'} />
        <Link to="/my-borrow-requests" className="text-xs font-semibold text-brand-600">
          ← Back to Requests
        </Link>
      </div>
    );
  }

  const statusBadge = getBorrowBadge(request.status);
  const isBorrower = user?._id === request.borrower?._id;
  const isOwner = user?._id === request.owner?._id;

  return (
    <div className="space-y-6">
      <Link
        to={isOwner ? '/borrow-requests-received' : '/my-borrow-requests'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {isOwner ? 'Back to Incoming Requests' : 'Back to My Requests'}
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.color}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-xs text-slate-400">
                Created {formatDateTime(request.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Borrow Request: {request.equipment?.name}
            </h1>
          </div>

          <Link
            to={`/equipment/${request.equipment?._id}`}
            className="px-4 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition shadow-xs flex-shrink-0"
          >
            View Equipment Listing
          </Link>
        </div>

        {/* Equipment Snapshot Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
            <img
              src={
                request.equipment?.images?.[0]
                  ? getFullImageUrl(request.equipment.images[0])
                  : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80'
              }
              alt={request.equipment?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{request.equipment?.name}</h3>
            <p className="text-xs text-slate-500">
              {request.equipment?.category} • Condition: {request.equipment?.condition}
            </p>
          </div>
        </div>

        {/* Timeline Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Booking Duration & Notes
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>
                  {formatDate(request.requestedFrom)} – {formatDate(request.requestedUntil)}
                </span>
              </div>
              <p className="text-xs text-slate-600 pt-1">
                <strong className="text-slate-800">Reason:</strong> {request.reason}
              </p>
              {request.message && (
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">Message:</strong> {request.message}
                </p>
              )}
            </div>

            {request.rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong>Declined Reason:</strong> {request.rejectionReason}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Parties Involved
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  Borrower: {request.borrower?.firstName} {request.borrower?.lastName}
                </p>
                <p className="text-slate-500 pl-5">
                  {request.borrower?.phone} • {request.borrower?.email}
                </p>
              </div>

              <div className="border-t border-slate-200/60 pt-2">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Equipment Owner: {request.owner?.firstName} {request.owner?.lastName}
                </p>
                <p className="text-slate-500 pl-5">
                  {request.owner?.phone} • {request.owner?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowRequestDetails;
