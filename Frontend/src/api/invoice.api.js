import apiClient from './axios';

export const getInvoices = async (params) => {
  const { data } = await apiClient.get('/invoices', { params });
  return data;
};

export const getInvoiceById = async (id) => {
  const { data } = await apiClient.get(`/invoices/${id}`);
  return data;
};

export const generateInvoice = async (poId, invoiceData) => {
  const { data } = await apiClient.post(`/invoices/from-po/${poId}`, invoiceData);
  return data;
};

export const updateInvoice = async (id, invoiceData) => {
  const { data } = await apiClient.put(`/invoices/${id}`, invoiceData);
  return data;
};

export const updateInvoiceStatus = async (id, status) => {
  const { data } = await apiClient.put(`/invoices/${id}/status`, { status });
  return data;
};

export const downloadInvoicePDF = async (id) => {
  const { data } = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  return data;
};

export const sendInvoiceEmail = async (id) => {
  const { data } = await apiClient.post(`/invoices/${id}/send-email`);
  return data;
};

export const markInvoicePaid = async (id, paymentMethod) => {
  const { data } = await apiClient.put(`/invoices/${id}/mark-paid`, { paymentMethod });
  return data;
};
