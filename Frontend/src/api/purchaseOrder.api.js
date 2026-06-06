import apiClient from './axios';

export const getPOs = async (params) => {
  const { data } = await apiClient.get('/purchase-orders', { params });
  return data;
};

export const getPOById = async (id) => {
  const { data } = await apiClient.get(`/purchase-orders/${id}`);
  return data;
};

export const generatePO = async (approvalId) => {
  const { data } = await apiClient.post(`/purchase-orders/from-approval/${approvalId}`);
  return data;
};

export const updatePO = async (id, poData) => {
  const { data } = await apiClient.put(`/purchase-orders/${id}`, poData);
  return data;
};

export const sendPO = async (id) => {
  const { data } = await apiClient.put(`/purchase-orders/${id}/send`);
  return data;
};

export const updatePOStatus = async (id, status) => {
  const { data } = await apiClient.put(`/purchase-orders/${id}/status`, { status });
  return data;
};

export const cancelPO = async (id) => {
  const { data } = await apiClient.delete(`/purchase-orders/${id}`);
  return data;
};
