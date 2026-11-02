import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ShieldCheck,
  Package,
  Layers,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import * as notificationService from '../services/notification.service';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getUserNotifications({ limit: 1, unreadOnly: true })
        .then((res) => {
          if (res?.data?.unreadCount !== undefined) {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
      isActive ? 'text-brand-700 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-health-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                Care<span className="text-brand-600">Share</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1 hidden sm:block">
                COMMUNITY BANK
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/equipment" className={navLinkClass}>
              Browse Equipment
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/add-equipment" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition ml-2">
                <PlusCircle className="w-4 h-4 text-brand-600" />
                Donate Equipment
              </NavLink>
            )}
          </nav>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications link */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm ring-1 ring-brand-300">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="font-semibold text-slate-800 leading-tight">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-slate-400 text-[10px] capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-700 font-medium hover:bg-brand-50 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/my-equipment"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        My Listed Equipment
                      </Link>

                      <Link
                        to="/my-borrow-requests"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        My Borrow Requests
                      </Link>

                      <Link
                        to="/borrow-requests-received"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <HeartHandshake className="w-4 h-4 text-slate-400" />
                        Incoming Requests
                      </Link>

                      <Link
                        to="/my-returns"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        Returns & Handover
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-50 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-brand-600"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
          >
            Home
          </NavLink>
          <NavLink
            to="/equipment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
          >
            Browse Equipment
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
          >
            About
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 rounded-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </NavLink>
              )}

              <NavLink
                to="/add-equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                Donate / List Equipment
              </NavLink>

              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile
              </NavLink>

              <NavLink
                to="/my-equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Package className="w-4 h-4 text-slate-400" />
                My Listed Equipment
              </NavLink>

              <NavLink
                to="/my-borrow-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                My Borrow Requests
              </NavLink>

              <NavLink
                to="/borrow-requests-received"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <HeartHandshake className="w-4 h-4 text-slate-400" />
                Incoming Requests
              </NavLink>

              <NavLink
                to="/my-returns"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                Returns & Handover
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg mt-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
