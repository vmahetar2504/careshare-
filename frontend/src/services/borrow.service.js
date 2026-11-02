import api from './api';

export const createBorrowRequest = async (requestData) => {
  const response = await api.post('/borrow-requests', requestData);
  return response.data;
};

export const getMyBorrowRequests = async (params = {}) => {
  const response = await api.get('/borrow-requests/my', { params });
  return response.data;
};

export const getReceivedBorrowRequests = async (params = {}) => {
  const response = await api.get('/borrow-requests/received', { params });
  return response.data;
};

export const getBorrowRequestById = async (id) => {
  const response = await api.get(`/borrow-requests/${id}`);
  return response.data;
};

export const approveBorrowRequest = async (id) => {
  const response = await api.patch(`/borrow-requests/${id}/approve`);
  return response.data;
};

export const rejectBorrowRequest = async (id, rejectionReason) => {
  const response = await api.patch(`/borrow-requests/${id}/reject`, { rejectionReason });
  return response.data;
};

export const cancelBorrowRequest = async (id) => {
  const response = await api.patch(`/borrow-requests/${id}/cancel`);
  return response.data;
};

export const pickupBorrowRequest = async (id) => {
  const response = await api.patch(`/borrow-requests/${id}/pickup`);
  return response.data;
};
