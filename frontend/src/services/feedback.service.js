import api from './api';

export const submitFeedback = async (payload) => {
  const response = await api.post('/feedback', payload);
  return response.data;
};

export const getMyFeedback = async (params = {}) => {
  const response = await api.get('/feedback/my', { params });
  return response.data;
};

export const getAdminFeedback = async (params = {}) => {
  const response = await api.get('/admin/feedback', { params });
  return response.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const response = await api.patch(`/admin/feedback/${id}/status`, { status });
  return response.data;
};
