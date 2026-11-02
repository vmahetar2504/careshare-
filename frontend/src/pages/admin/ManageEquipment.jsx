import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Trash2, Eye, Filter } from 'lucide-react';
import * as equipmentService from '../../services/equipment.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import { getAvailabilityBadge, getVerificationBadge, getFullImageUrl } from '../../utils/formatStatus';
import { formatDate } from '../../utils/formatDate';

export const ManageEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page,
        limit: 8,
        includeAllStatuses: true,
      };
      if (search.trim()) query.search = search.trim();
      if (statusFilter) query.availabilityStatus = statusFilter;

      const res = await equipmentService.getAllEquipment(query);
      if (res?.data) {
        setEquipmentList(res.data.equipment || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load equipment catalog.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await equipmentService.deleteEquipment(deleteTarget._id);
      setDeleteTarget(null);
      fetchEquipment();
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to delete equipment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage All Equipment</h2>
          <p className="text-xs text-slate-500">
            System-wide inventory control and status monitoring.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search equipment..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BORROWED">Borrowed</option>
            <option value="RESERVED">Reserved</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="SANITIZATION">Sanitization</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchEquipment} />

      {loading ? (
        <Loading text="Loading equipment inventory..." />
      ) : equipmentList.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Verification</th>
                    <th className="px-5 py-3">Availability</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipmentList.map((item) => {
                    const verification = getVerificationBadge(item.verificationStatus);
                    const availability = getAvailabilityBadge(item.availabilityStatus);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-3">
                          <img
                            src={
                              item.images?.[0]
                                ? getFullImageUrl(item.images[0])
                                : 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=80&q=80'
                            }
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="truncate max-w-[180px]">{item.name}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{item.category}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {item.owner?.firstName} {item.owner?.lastName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${verification.color}`}
                          >
                            {verification.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${availability.color}`}
                          >
                            {availability.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <Link
                            to={`/equipment/${item._id}`}
                            className="p-1.5 text-slate-500 hover:text-brand-600 inline-block"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 inline-block"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Equipment Found"
          description="No equipment matched your filters."
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Admin Equipment Deletion"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Yes, Delete"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default ManageEquipment;
