import api from './api';

export const getPendingEquipment = async (params = {}) => {
  const response = await api.get('/admin/equipment/pending', { params });
  return response.data;
};

export const getAllEquipment = async (params = {}) => {
  const response = await api.get('/admin/equipment', { params });
  return response.data;
};

export const approveEquipment = async (id) => {
  const response = await api.patch(`/admin/equipment/${id}/approve`);
  return response.data;
};

export const rejectEquipment = async (id, rejectionReason) => {
  const response = await api.patch(`/admin/equipment/${id}/reject`, { rejectionReason });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/admin/users/${id}/toggle-status`);
  return response.data;
};

export const getAllBorrowRequests = async (params = {}) => {
  const response = await api.get('/admin/borrow-requests', { params });
  return response.data;
};

export const getAllReturns = async (params = {}) => {
  const response = await api.get('/admin/returns', { params });
  return response.data;
};

export const getAllFeedback = async (params = {}) => {
  const response = await api.get('/admin/feedback', { params });
  return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const response = await api.patch(`/admin/feedback/${id}/status`, { status });
  return response.data;
};

const adminService = {
  getPendingEquipment,
  getAllEquipment,
  approveEquipment,
  rejectEquipment,
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllBorrowRequests,
  getAllReturns,
  getAllFeedback,
  updateFeedbackStatus,
};

export default adminService;
