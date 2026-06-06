import apiClient from './axios';

export const getDashboardSummary = async () => {
  const { data } = await apiClient.get('/analytics/dashboard');
  return data;
};

export const getMonthlySpending = async (params) => {
  const { data } = await apiClient.get('/analytics/spending', { params });
  return data;
};

export const getVendorPerformance = async (params) => {
  const { data } = await apiClient.get('/analytics/vendors', { params });
  return data;
};

export const getProcurementStats = async (params) => {
  const { data } = await apiClient.get('/analytics/procurement', { params });
  return data;
};

export const getRFQStatusDistribution = async () => {
  const { data } = await apiClient.get('/analytics/rfq-status');
  return data;
};

export const getTopVendors = async () => {
  const { data } = await apiClient.get('/analytics/top-vendors');
  return data;
};
