import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Equipment from '../pages/Equipment';
import EquipmentDetails from '../pages/EquipmentDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

// User Workspace Pages
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import MyEquipment from '../pages/MyEquipment';
import AddEquipment from '../pages/AddEquipment';
import EditEquipment from '../pages/EditEquipment';
import MyBorrowRequests from '../pages/MyBorrowRequests';
import BorrowRequestsReceived from '../pages/BorrowRequestsReceived';
import BorrowRequestDetails from '../pages/BorrowRequestDetails';
import MyReturns from '../pages/MyReturns';
import Notifications from '../pages/Notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import PendingEquipment from '../pages/admin/PendingEquipment';
import ManageEquipment from '../pages/admin/ManageEquipment';
import ManageBorrowRequests from '../pages/admin/ManageBorrowRequests';
import ManageReturns from '../pages/admin/ManageReturns';
import Inspections from '../pages/admin/Inspections';
import Sanitization from '../pages/admin/Sanitization';
import ManageUsers from '../pages/admin/Users';
import ManageFeedback from '../pages/admin/Feedback';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminProfile from '../pages/admin/AdminProfile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected User Workspace */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/my-equipment" element={<MyEquipment />} />
          <Route path="/add-equipment" element={<AddEquipment />} />
          <Route path="/my-equipment/:id/edit" element={<EditEquipment />} />
          <Route path="/my-borrow-requests" element={<MyBorrowRequests />} />
          <Route path="/borrow-requests-received" element={<BorrowRequestsReceived />} />
          <Route path="/borrow-requests/:id" element={<BorrowRequestDetails />} />
          <Route path="/my-returns" element={<MyReturns />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Protected Admin Console */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/pending-equipment" element={<PendingEquipment />} />
          <Route path="/admin/equipment/pending" element={<Navigate to="/admin/pending-equipment" replace />} />
          <Route path="/admin/equipment" element={<ManageEquipment />} />
          <Route path="/admin/borrow-requests" element={<ManageBorrowRequests />} />
          <Route path="/admin/returns" element={<ManageReturns />} />
          <Route path="/admin/inspections" element={<Inspections />} />
          <Route path="/admin/sanitization" element={<Sanitization />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/feedback" element={<ManageFeedback />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
