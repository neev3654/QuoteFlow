import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as poApi from '../api/purchaseOrder.api';

export const usePurchaseOrders = (params) => {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => poApi.getPOs(params),
  });
};

export const usePurchaseOrder = (id) => {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => poApi.getPOById(id),
    enabled: !!id,
  });
};

export const useGeneratePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: poApi.generatePO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase Order generated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate Purchase Order');
    },
  });
};

export const useUpdatePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => poApi.updatePO(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
      toast.success('Purchase Order updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update Purchase Order');
    },
  });
};

export const useSendPO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: poApi.sendPO,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      toast.success('Purchase Order sent successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send Purchase Order');
    },
  });
};

export const useUpdatePOStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => poApi.updatePOStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', variables.id] });
      toast.success('Purchase Order status updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update Purchase Order status');
    },
  });
};

export const useCancelPO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: poApi.cancelPO,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      toast.success('Purchase Order cancelled successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel Purchase Order');
    },
  });
};
