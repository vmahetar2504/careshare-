import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Package,
  Layers,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import * as notificationService from '../services/notification.service';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { formatDateTime } from '../utils/formatDate';

export const Notifications = () => {
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
      const res = await notificationService.getUserNotifications({ page, limit: 10 });
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load notifications.');
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
      case 'BORROW_REQUEST':
      case 'BORROW_APPROVED':
      case 'BORROW_REJECTED':
        return <Layers className="w-5 h-5 text-brand-600" />;
      case 'EQUIPMENT_VERIFIED':
      case 'EQUIPMENT_REJECTED':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'RETURN_REQUESTED':
        return <RotateCcw className="w-5 h-5 text-purple-600" />;
      case 'SANITIZATION':
      case 'INSPECTION':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-semibold">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time updates regarding your medical equipment, borrows, and returns.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition shadow-xs self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      <ErrorMessage message={error} onRetry={fetchNotifications} />

      {loading ? (
        <Loading text="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-slate-200/80'
                  : 'bg-brand-50/40 border-brand-200 shadow-xs ring-1 ring-brand-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                  {getIconForType(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block pt-0.5">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n._id)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition flex-shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are completely caught up! We'll notify you whenever your equipment status changes."
        />
      )}
    </div>
  );
};

export default Notifications;
