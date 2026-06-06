import apiClient from './axios';

export const getApprovals = async (params) => {
  const { data } = await apiClient.get('/approvals', { params });
  return data;
};

export const getPendingApprovals = async () => {
  const { data } = await apiClient.get('/approvals/pending');
  return data;
};

export const getApprovalById = async (id) => {
  const { data } = await apiClient.get(`/approvals/${id}`);
  return data;
};

export const initiateApproval = async (quotationId, approverId) => {
  const { data } = await apiClient.post('/approvals', { quotationId, approverId });
  return data;
};

export const approveApproval = async (id, remarks) => {
  const { data } = await apiClient.put(`/approvals/${id}/approve`, { remarks });
  return data;
};

export const rejectApproval = async (id, remarks) => {
  const { data } = await apiClient.put(`/approvals/${id}/reject`, { remarks });
  return data;
};

export const getQuotationApproval = async (quotationId) => {
  const { data } = await apiClient.get(`/approvals/quotation/${quotationId}`);
  return data;
};
