import apiClient from './axios';

export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};

export const logout = async () => {
  const { data } = await apiClient.post('/auth/logout');
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export const refreshToken = async (token) => {
  const { data } = await apiClient.post('/auth/refresh-token', { refreshToken: token });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await apiClient.put(`/auth/reset-password/${token}`, { password });
  return data;
};
