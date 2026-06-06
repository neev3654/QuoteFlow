import apiClient from './axios';

export const getAllLogs = async (params) => {
  const { data } = await apiClient.get('/activity', { params });
  return data;
};

export const getMyLogs = async (params) => {
  const { data } = await apiClient.get('/activity/my', { params });
  return data;
};

export const getLogsByModule = async (module, params) => {
  const { data } = await apiClient.get(`/activity/module/${module}`, { params });
  return data;
};
