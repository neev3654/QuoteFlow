import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as rfqApi from '../api/rfq.api';

export const useRFQs = (params) => {
  return useQuery({
    queryKey: ['rfqs', params],
    queryFn: () => rfqApi.getRFQs(params),
  });
};

export const useMyRFQs = (params) => {
  return useQuery({
    queryKey: ['rfqs', 'my', params],
    queryFn: () => rfqApi.getMyRFQs(params),
  });
};

export const useRFQ = (id) => {
  return useQuery({
    queryKey: ['rfqs', id],
    queryFn: () => rfqApi.getRFQById(id),
    enabled: !!id,
  });
};

export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.createRFQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create RFQ');
    },
  });
};

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => rfqApi.updateRFQ(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.id] });
      toast.success('RFQ updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update RFQ');
    },
  });
};

export const useCancelRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.cancelRFQ,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
      toast.success('RFQ cancelled successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel RFQ');
    },
  });
};

export const usePublishRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.publishRFQ,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
      toast.success('RFQ published successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish RFQ');
    },
  });
};

export const useCloseRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.closeRFQ,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
      toast.success('RFQ closed successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to close RFQ');
    },
  });
};

export const useAddVendorsToRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vendorIds }) => rfqApi.addVendorsToRFQ(id, vendorIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.id] });
      toast.success('Vendors added to RFQ successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add vendors to RFQ');
    },
  });
};

export const useRemoveVendorFromRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rfqId, vendorId }) => rfqApi.removeVendorFromRFQ(rfqId, vendorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', variables.rfqId] });
      toast.success('Vendor removed from RFQ successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to remove vendor from RFQ');
    },
  });
};

export const useRFQQuotations = (id) => {
  return useQuery({
    queryKey: ['rfqs', id, 'quotations'],
    queryFn: () => rfqApi.getRFQQuotations(id),
    enabled: !!id,
  });
};
