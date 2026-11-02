import api from './api';

export const createReturnRequest = async (data) => {
  const response = await api.post('/returns', data);
  return response.data;
};

export const receiveReturn = async (id, data) => {
  const response = await api.patch(`/returns/${id}/receive`, data);
  return response.data;
};

export const getReturnById = async (id) => {
  const response = await api.get(`/returns/${id}`);
  return response.data;
};

export const getAllReturns = async (params = {}) => {
  const response = await api.get('/returns', { params });
  return response.data;
};
