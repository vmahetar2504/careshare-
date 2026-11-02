import api from './api';

export const getAllEquipment = async (params = {}) => {
  const response = await api.get('/equipment', { params });
  return response.data;
};

export const getEquipmentById = async (id) => {
  const response = await api.get(`/equipment/${id}`);
  return response.data;
};

export const getMyEquipment = async (params = {}) => {
  const response = await api.get('/equipment/my/listings', { params });
  return response.data;
};

export const createEquipment = async (formData) => {
  const response = await api.post('/equipment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateEquipment = async (id, formData) => {
  const response = await api.put(`/equipment/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await api.delete(`/equipment/${id}`);
  return response.data;
};
