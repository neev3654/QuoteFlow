import apiClient from './axios';

export const getQuotations = async (params) => {
  const { data } = await apiClient.get('/quotations', { params });
  return data;
};

export const getMyQuotations = async (params) => {
  const { data } = await apiClient.get('/quotations/my', { params });
  return data;
};

export const getQuotationById = async (id) => {
  const { data } = await apiClient.get(`/quotations/${id}`);
  return data;
};

export const submitQuotation = async (rfqId, quotationData) => {
  const { data } = await apiClient.post(`/quotations/rfq/${rfqId}`, quotationData);
  return data;
};

export const editQuotation = async (id, quotationData) => {
  const { data } = await apiClient.put(`/quotations/${id}`, quotationData);
  return data;
};

export const finalizeQuotation = async (id) => {
  const { data } = await apiClient.put(`/quotations/${id}/finalize`);
  return data;
};

export const acceptQuotation = async (id) => {
  const { data } = await apiClient.put(`/quotations/${id}/accept`);
  return data;
};

export const rejectQuotation = async (id, reason) => {
  const { data } = await apiClient.put(`/quotations/${id}/reject`, { reason });
  return data;
};

export const compareQuotations = async (rfqId, sortBy) => {
  const params = sortBy ? { sortBy } : {};
  const { data } = await apiClient.get(`/quotations/compare/${rfqId}`, { params });
  return data;
};
