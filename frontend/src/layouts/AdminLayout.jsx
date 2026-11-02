import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  LayoutDashboard,
  Clock,
  Package,
  ClipboardList,
  Sparkles,
  Users,
  Layers,
  RotateCcw,
  Bell,
  Shield,
  ArrowLeft,
  MessageSquareText,
} from 'lucide-react';

export const AdminLayout = () => {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />

      <div className="bg-slate-900 text-white border-b border-slate-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CareShare Admin Operations Panel
          </div>
          <Link
            to="/equipment"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Catalog
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 sticky top-24">
              <div className="px-3 py-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </span>
              </div>

              <NavLink to="/admin" end className={navItemClass}>
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                Dashboard Overview
              </NavLink>

              <NavLink to="/admin/pending-equipment" className={navItemClass}>
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Verification
              </NavLink>

              <NavLink to="/admin/equipment" className={navItemClass}>
                <Package className="w-4 h-4 text-blue-500" />
                Manage Equipment
              </NavLink>

              <NavLink to="/admin/borrow-requests" className={navItemClass}>
                <Layers className="w-4 h-4 text-indigo-500" />
                Manage Borrow Requests
              </NavLink>

              <NavLink to="/admin/returns" className={navItemClass}>
                <RotateCcw className="w-4 h-4 text-sky-500" />
                Manage Returns
              </NavLink>

              <NavLink to="/admin/inspections" className={navItemClass}>
                <ClipboardList className="w-4 h-4 text-purple-500" />
                Damage Inspections
              </NavLink>

              <NavLink to="/admin/sanitization" className={navItemClass}>
                <Sparkles className="w-4 h-4 text-cyan-500" />
                Sanitization Logs
              </NavLink>

              <NavLink to="/admin/users" className={navItemClass}>
                <Users className="w-4 h-4 text-slate-600" />
                User Directory
              </NavLink>

              <NavLink to="/admin/feedback" className={navItemClass}>
                <MessageSquareText className="w-4 h-4 text-cyan-600" />
                Feedback Queue
              </NavLink>

              <div className="pt-2 pb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Operations & Security
                </span>
              </div>

              <NavLink to="/admin/notifications" className={navItemClass}>
                <Bell className="w-4 h-4 text-rose-500" />
                Alerts & Audit
              </NavLink>

              <NavLink to="/admin/profile" className={navItemClass}>
                <Shield className="w-4 h-4 text-purple-600" />
                Admin Profile
              </NavLink>
            </div>
          </aside>

          {/* Admin Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
