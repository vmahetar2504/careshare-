import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  User,
  Package,
  Layers,
  HeartHandshake,
  RotateCcw,
  Bell,
  PlusCircle,
} from 'lucide-react';

export const UserLayout = () => {
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 sticky top-24">
              <div className="px-3 py-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  User Workspace
                </span>
              </div>

              <NavLink to="/profile" end className={navItemClass}>
                <User className="w-4 h-4" />
                My Profile
              </NavLink>

              <NavLink to="/my-equipment" className={navItemClass}>
                <Package className="w-4 h-4" />
                My Equipment
              </NavLink>

              <NavLink to="/add-equipment" className={navItemClass}>
                <PlusCircle className="w-4 h-4" />
                Donate Equipment
              </NavLink>

              <NavLink to="/my-borrow-requests" className={navItemClass}>
                <Layers className="w-4 h-4" />
                My Borrow Requests
              </NavLink>

              <NavLink to="/borrow-requests-received" className={navItemClass}>
                <HeartHandshake className="w-4 h-4" />
                Incoming Requests
              </NavLink>

              <NavLink to="/my-returns" className={navItemClass}>
                <RotateCcw className="w-4 h-4" />
                Returns & Handover
              </NavLink>

              <NavLink to="/notifications" className={navItemClass}>
                <Bell className="w-4 h-4" />
                Notifications
              </NavLink>
            </div>
          </aside>

          {/* Main User Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserLayout;
