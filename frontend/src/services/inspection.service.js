import api from './api';

export const getAllInspections = async (params = {}) => {
  const response = await api.get('/inspections', { params });
  return response.data;
};

export const createInspection = async (data) => {
  const response = await api.post('/inspections', data);
  return response.data;
};

export const getInspectionById = async (id) => {
  const response = await api.get(`/inspections/${id}`);
  return response.data;
};

export const updateInspection = async (id, data) => {
  const response = await api.patch(`/inspections/${id}`, data);
  return response.data;
};
