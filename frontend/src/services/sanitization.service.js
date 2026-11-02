import api from './api';

export const getAllSanitizations = async (params = {}) => {
  const response = await api.get('/sanitization', { params });
  return response.data;
};

export const createSanitization = async (data) => {
  const response = await api.post('/sanitization', data);
  return response.data;
};

export const getSanitizationById = async (id) => {
  const response = await api.get(`/sanitization/${id}`);
  return response.data;
};

export const completeSanitization = async (id, data = {}) => {
  const response = await api.patch(`/sanitization/${id}/complete`, data);
  return response.data;
};
