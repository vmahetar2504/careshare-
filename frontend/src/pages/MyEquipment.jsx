import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit3, Trash2, Eye, Package, MapPin, Tag } from 'lucide-react';
import * as equipmentService from '../services/equipment.service';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { getAvailabilityBadge, getVerificationBadge, getFullImageUrl } from '../utils/formatStatus';
import { formatDate } from '../utils/formatDate';

export const MyEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 6 };
      if (statusFilter !== 'ALL') {
        if (['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter)) {
          query.verificationStatus = statusFilter;
        } else {
          query.availabilityStatus = statusFilter;
        }
      }

      const res = await equipmentService.getMyEquipment(query);
      if (res?.data) {
        setEquipmentList(res.data.equipment || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load your equipment listings.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchMyEquipment();
  }, [fetchMyEquipment]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await equipmentService.deleteEquipment(deleteTarget._id);
      setDeleteTarget(null);
      fetchMyEquipment();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to delete equipment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Equipment' },
    { id: 'PENDING', label: 'Pending Verification' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'AVAILABLE', label: 'Available' },
    { id: 'BORROWED', label: 'Borrowed' },
    { id: 'MAINTENANCE', label: 'Maintenance' },
    { id: 'SANITIZATION', label: 'Sanitization' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Listed Equipment</h2>
          <p className="text-xs text-slate-500">
            Manage your medical equipment contributions and track their verification.
          </p>
        </div>
        <Link
          to="/add-equipment"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Donate Equipment
        </Link>
      </div>

      {/* Filter Tabs */}
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

      <ErrorMessage message={error} onRetry={fetchMyEquipment} />

      {loading ? (
        <Loading text="Loading your listings..." />
      ) : equipmentList.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentList.map((item) => {
              const availability = getAvailabilityBadge(item.availabilityStatus);
              const verification = getVerificationBadge(item.verificationStatus);
              const isDeletable = !['BORROWED', 'RESERVED'].includes(item.availabilityStatus);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-card transition"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.images && item.images.length > 0
                            ? getFullImageUrl(item.images[0])
                            : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verification.color}`}
                        >
                          {verification.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${availability.color}`}
                        >
                          {availability.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 truncate">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.category} • Condition: {item.condition}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.location?.city || 'Local area'} • Listed {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  {item.rejectionReason && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      <strong>Admin Note:</strong> {item.rejectionReason}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/equipment/${item._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-brand-600"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Public Page
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/my-equipment/${item._id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        title="Edit Equipment"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      {isDeletable && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Equipment Listed"
          description="You haven't listed any medical equipment in this category yet. Share care by donating items you no longer use."
          actionLabel="Donate Equipment Now"
          actionLink="/add-equipment"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Equipment Listing"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyEquipment;
