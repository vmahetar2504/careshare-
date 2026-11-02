import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  ShieldAlert,
  ShieldCheck,
  Layers,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import * as notificationService from '../../services/notification.service';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import { formatDateTime } from '../../utils/formatDate';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getUserNotifications({ page, limit: 12 });
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load admin notifications.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to mark all notifications as read.');
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'EQUIPMENT_VERIFIED':
      case 'EQUIPMENT_APPROVED':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'EQUIPMENT_REJECTED':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'BORROW_REQUEST':
      case 'BORROW_APPROVED':
      case 'BORROW_REJECTED':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'RETURN_REQUESTED':
      case 'RETURN_COMPLETED':
        return <RotateCcw className="w-5 h-5 text-purple-600" />;
      case 'INSPECTION':
      case 'SANITIZATION':
        return <Sparkles className="w-5 h-5 text-cyan-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            Operations Audit & Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 font-semibold">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time audit log of equipment submissions, status transitions, and platform alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <ErrorMessage message={error} onRetry={fetchNotifications} />

      {loading ? (
        <Loading text="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`p-4 flex items-start gap-4 transition ${
                  item.isRead ? 'bg-white' : 'bg-brand-50/30'
                }`}
              >
                <div className="mt-0.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {getIconForType(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>

                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(item._id)}
                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="Your administrative inbox is all clear. No pending alerts."
        />
      )}
    </div>
  );
};

export default AdminNotifications;
