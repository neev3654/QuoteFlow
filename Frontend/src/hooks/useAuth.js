import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';
import * as authApi from '../api/auth.api';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('Logged in successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success('Registration successful');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (err) => {
      // Force logout anyway
      logout();
      queryClient.clear();
      toast.error(err.message || 'Error during logout');
    },
  });
};

export const useGetMe = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send reset email');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }) => authApi.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Password reset failed');
    },
  });
};
