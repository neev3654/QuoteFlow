import apiClient from './axios';

export const getVendors = async (params) => {
  const { data } = await apiClient.get('/vendors', { params });
  return data;
};

export const getVendorById = async (id) => {
  const { data } = await apiClient.get(`/vendors/${id}`);
  return data;
};

export const createVendor = async (vendorData) => {
  const { data } = await apiClient.post('/vendors', vendorData);
  return data;
};

export const updateVendor = async (id, vendorData) => {
  const { data } = await apiClient.put(`/vendors/${id}`, vendorData);
  return data;
};

export const deleteVendor = async (id) => {
  const { data } = await apiClient.delete(`/vendors/${id}`);
  return data;
};

export const updateVendorStatus = async (id, status) => {
  const { data } = await apiClient.put(`/vendors/${id}/status`, { status });
  return data;
};

export const getVendorRFQs = async (id) => {
  const { data } = await apiClient.get(`/vendors/${id}/rfqs`);
  return data;
};

export const getVendorQuotations = async (id) => {
  const { data } = await apiClient.get(`/vendors/${id}/quotations`);
  return data;
};

export const getVendorOrders = async (id) => {
  const { data } = await apiClient.get(`/vendors/${id}/orders`);
  return data;
};
