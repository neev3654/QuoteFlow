import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as vendorApi from '../api/vendor.api';

export const useVendors = (params) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => vendorApi.getVendors(params),
  });
};

export const useVendor = (id) => {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorApi.getVendorById(id),
    enabled: !!id,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorApi.createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create vendor');
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => vendorApi.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.id] });
      toast.success('Vendor updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update vendor');
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorApi.deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('Vendor deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete vendor');
    },
  });
};

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => vendorApi.updateVendorStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.id] });
      toast.success('Vendor status updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update vendor status');
    },
  });
};

export const useVendorRFQs = (id) => {
  return useQuery({
    queryKey: ['vendors', id, 'rfqs'],
    queryFn: () => vendorApi.getVendorRFQs(id),
    enabled: !!id,
  });
};

export const useVendorQuotations = (id) => {
  return useQuery({
    queryKey: ['vendors', id, 'quotations'],
    queryFn: () => vendorApi.getVendorQuotations(id),
    enabled: !!id,
  });
};

export const useVendorOrders = (id) => {
  return useQuery({
    queryKey: ['vendors', id, 'orders'],
    queryFn: () => vendorApi.getVendorOrders(id),
    enabled: !!id,
  });
};
