import apiClient from './axios';

export const getRFQs = async (params) => {
  const { data } = await apiClient.get('/rfqs', { params });
  return data;
};

export const getMyRFQs = async (params) => {
  const { data } = await apiClient.get('/rfqs/my', { params });
  return data;
};

export const getRFQById = async (id) => {
  const { data } = await apiClient.get(`/rfqs/${id}`);
  return data;
};

export const createRFQ = async (rfqData) => {
  const { data } = await apiClient.post('/rfqs', rfqData);
  return data;
};

export const updateRFQ = async (id, rfqData) => {
  const { data } = await apiClient.put(`/rfqs/${id}`, rfqData);
  return data;
};

export const cancelRFQ = async (id) => {
  const { data } = await apiClient.delete(`/rfqs/${id}`);
  return data;
};

export const publishRFQ = async (id) => {
  const { data } = await apiClient.put(`/rfqs/${id}/publish`);
  return data;
};

export const closeRFQ = async (id) => {
  const { data } = await apiClient.put(`/rfqs/${id}/close`);
  return data;
};

export const addVendorsToRFQ = async (id, vendorIds) => {
  const { data } = await apiClient.post(`/rfqs/${id}/vendors`, { vendorIds });
  return data;
};

export const removeVendorFromRFQ = async (rfqId, vendorId) => {
  const { data } = await apiClient.delete(`/rfqs/${rfqId}/vendors/${vendorId}`);
  return data;
};

export const getRFQQuotations = async (id) => {
  const { data } = await apiClient.get(`/rfqs/${id}/quotations`);
  return data;
};
